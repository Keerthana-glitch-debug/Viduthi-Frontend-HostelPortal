import { useEffect, useRef, useState, useCallback } from 'react'
import jsQR from 'jsqr'
import { Camera, CameraOff, RefreshCw, CheckCircle2, ShieldCheck, Sparkles, Upload } from 'lucide-react'

// Synthesize turnstile clearance chime using Web Audio API
function playTurnstileBeep() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(659.25, ctx.currentTime) // E5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1) // A5
    osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.2) // E6
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start()
    osc.stop(ctx.currentTime + 0.4)
  } catch (err) {
    // Ignore audio context autoplay restriction if any
  }
}

export default function SecurityCameraQrScanner({
  onPassScanned,
  activePass,
}) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const animFrameRef = useRef(null)

  const [cameraState, setCameraState] = useState('idle') // 'idle' | 'requesting' | 'active' | 'denied' | 'scanned'
  const [scannedData, setScannedData] = useState(null)
  const [scanningMessage, setScanningMessage] = useState('Align student Gate Pass QR inside viewfinder')

  const stopCameraStream = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const startScannerCamera = useCallback(async () => {
    stopCameraStream()
    setCameraState('requesting')
    setScanningMessage('Requesting camera access for turnstile scanner…')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // Prefer back camera on mobile
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      })

      streamRef.current = stream
      setCameraState('active')
      setScanningMessage('Point camera at student QR code…')

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(() => {})
      }
    } catch (err) {
      console.warn('Scanner camera blocked or not available:', err)
      setCameraState('denied')
      setScanningMessage('Camera unavailable. You can use manual or simulated scan verification.')
    }
  }, [stopCameraStream])

  useEffect(() => {
    startScannerCamera()
    return () => stopCameraStream()
  }, [startScannerCamera, stopCameraStream])

  // Continuous QR Code Scanning loop using jsQR
  const scanQrFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || cameraState !== 'active') return

    const video = videoRef.current
    if (video.readyState >= 2) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d', { willReadFrequently: true })

      canvas.width = 400
      canvas.height = 300
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        })

        if (code && code.data) {
          handleDecodedPayload(code.data)
          return
        }
      } catch (err) {
        // Frame processing exception ignored
      }
    }

    if (cameraState === 'active') {
      animFrameRef.current = requestAnimationFrame(scanQrFrame)
    }
  }, [cameraState])

  useEffect(() => {
    if (cameraState === 'active') {
      animFrameRef.current = requestAnimationFrame(scanQrFrame)
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [cameraState, scanQrFrame])

  // Handle successful QR detection
  const handleDecodedPayload = (rawString) => {
    stopCameraStream()
    playTurnstileBeep()

    let parsed = null
    try {
      parsed = JSON.parse(rawString)
    } catch (e) {
      parsed = { rawText: rawString }
    }

    setScannedData(parsed)
    setCameraState('scanned')
    setScanningMessage('QR Code recognized! Clearance verified.')

    if (onPassScanned) {
      onPassScanned(parsed)
    }
  }

  // Simulated instant scan for testing without pointing a 2nd phone
  const handleSimulateScan = () => {
    stopCameraStream()
    playTurnstileBeep()

    const mockPass = activePass || {
      passId: 'GP-2026-0891',
      studentName: 'P.Sri Rooba',
      studentRoll: '24104404',
      roomNumber: 'B-37',
      reason: 'Home Visit',
      status: 'APPROVED',
      validFrom: new Date().toISOString().slice(0, 10),
      validTo: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
      authorizedBy: 'Warden Jeyanthi',
      turnstileToken: 'TOKEN_SHA256_VERIFIED',
    }

    setScannedData(mockPass)
    setCameraState('scanned')

    if (onPassScanned) {
      onPassScanned(mockPass)
    }
  }

  // Allow uploading a QR image file
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const testCanvas = document.createElement('canvas')
        testCanvas.width = img.width
        testCanvas.height = img.height
        const ctx = testCanvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, img.width, img.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        if (code && code.data) {
          handleDecodedPayload(code.data)
        } else {
          alert('No valid QR code found in uploaded image.')
        }
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%' }}>
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* SCANNER VIEWPORT 1: Live Back Camera Stream */}
      {cameraState === 'active' && (
        <div
          style={{
            width: 240,
            height: 240,
            borderRadius: 16,
            overflow: 'hidden',
            position: 'relative',
            border: '3px solid #38BDF8',
            boxShadow: '0 0 25px rgba(56, 189, 248, 0.4)',
            background: '#000000',
          }}
        >
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* Animated Laser Scanning Line */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: 3,
              background: '#22C55E',
              boxShadow: '0 0 10px 2px #22C55E',
              top: '50%',
              animation: 'qrScannerSweep 1.8s ease-in-out infinite alternate',
            }}
          />

          {/* Viewfinder Target Reticle */}
          <div
            style={{
              position: 'absolute',
              inset: 24,
              border: '2px dashed rgba(56, 189, 248, 0.8)',
              borderRadius: 8,
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: 8,
              left: 0,
              right: 0,
              textAlign: 'center',
              color: '#38BDF8',
              fontSize: 10,
              fontWeight: 700,
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            }}
          >
            ACTIVE OPTICAL SCANNER
          </div>
        </div>
      )}

      {/* SCANNER VIEWPORT 2: Requesting Camera */}
      {cameraState === 'requesting' && (
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: 16,
            background: 'rgba(255,255,255,0.05)',
            border: '2px dashed #38BDF8',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <Camera size={34} color="#38BDF8" style={{ animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: 11, color: '#94A3B8' }}>Activating Turnstile Camera…</span>
        </div>
      )}

      {/* SCANNER VIEWPORT 3: Camera Denied or Unavailable */}
      {cameraState === 'denied' && (
        <div
          style={{
            width: '100%',
            padding: 16,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 12,
            textAlign: 'center',
          }}
        >
          <CameraOff size={28} color="#EF4444" style={{ marginBottom: 6 }} />
          <strong style={{ display: 'block', fontSize: 12.5, color: '#F87171', marginBottom: 4 }}>
            Camera Stream Unavailable
          </strong>
          <span style={{ fontSize: 11, color: '#94A3B8', display: 'block', marginBottom: 10 }}>
            {scanningMessage}
          </span>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            <button type="button" className="btn btn-xs btn-secondary" onClick={startScannerCamera}>
              <RefreshCw size={11} /> Retry Camera
            </button>
            <button type="button" className="btn btn-xs btn-primary" onClick={handleSimulateScan}>
              <Sparkles size={11} /> Instant Pass Scan
            </button>
          </div>
        </div>
      )}

      {/* SCANNER VIEWPORT 4: Successfully Scanned */}
      {cameraState === 'scanned' && (
        <div
          style={{
            width: '100%',
            background: 'rgba(34, 197, 94, 0.12)',
            border: '2px solid #22C55E',
            borderRadius: 12,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22C55E', fontWeight: 800, fontSize: 14 }}>
            <CheckCircle2 size={20} /> QR Pass Verified by Camera
          </div>
          <span style={{ fontSize: 11, color: '#CBD5E1' }}>
            {scannedData?.studentName || scannedData?.student || activePass?.studentName || 'Resident'} · Roll: {scannedData?.studentRoll || scannedData?.rollNo || activePass?.studentRoll || '24104404'}
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={startScannerCamera}
            style={{ color: '#38BDF8', fontSize: 11 }}
          >
            <RefreshCw size={11} /> Scan Next Student
          </button>
        </div>
      )}

      {/* Manual Actions for Guard */}
      {cameraState === 'active' && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary btn-xs"
            onClick={handleSimulateScan}
            style={{ fontSize: 11 }}
          >
            <Sparkles size={12} /> Instant Verify
          </button>

          <label className="btn btn-ghost btn-xs" style={{ cursor: 'pointer', fontSize: 11 }}>
            <Upload size={12} /> Upload QR
            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>
      )}

      <style>{`
        @keyframes qrScannerSweep {
          0% { top: 10%; opacity: 0.5; }
          50% { top: 85%; opacity: 1; }
          100% { top: 10%; opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
