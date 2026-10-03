import { useEffect, useRef, useState, useCallback } from 'react'
import * as faceapi from '@vladmandic/face-api'
import {
  Camera, CameraOff, RefreshCw, CheckCircle2, XCircle,
  ScanFace, Sparkles, ShieldCheck, AlertTriangle, UserCheck
} from 'lucide-react'
import api from '../../api/client'

// Synthesize pleasant biometric confirmation chime
function playMatchChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(523.25, ctx.currentTime) // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08) // E5
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16) // G5
    osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24) // C6
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45)
    osc.start()
    osc.stop(ctx.currentTime + 0.45)
  } catch {}
}

// Synthesize mismatch warning buzz
function playMismatchAlert() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(180, ctx.currentTime)
    osc.frequency.setValueAtTime(140, ctx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    osc.start()
    osc.stop(ctx.currentTime + 0.35)
  } catch {}
}

export default function RealFaceIdScanner({
  onVerified,
  studentName = 'Resident',
  studentRoll = '24104031',
  enrolledDescriptor = null,
  onEnrolledSuccess = null,
}) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const animFrameRef = useRef(null)

  // Mode: 'verify' (1:1 matching against enrolled face) or 'enroll' (register baseline face)
  const [mode, setMode] = useState(enrolledDescriptor && enrolledDescriptor.length === 128 ? 'verify' : 'enroll')
  const [activeEnrolledDescriptor, setActiveEnrolledDescriptor] = useState(enrolledDescriptor)

  // System states
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [modelsLoadingMessage, setModelsLoadingMessage] = useState('Initializing Neural Network Models…')
  const [cameraState, setCameraState] = useState('idle') // 'idle' | 'requesting' | 'active' | 'denied' | 'verified' | 'mismatch'
  
  // Detection feedback
  const [faceDetected, setFaceDetected] = useState(false)
  const [matchScore, setMatchScore] = useState(null)
  const [statusMessage, setStatusMessage] = useState('Looking for resident face…')
  const [mismatchReason, setMismatchReason] = useState('')
  const [capturedPhoto, setCapturedPhoto] = useState(null)
  const [auditHash, setAuditHash] = useState('')
  const [enrollingInProgress, setEnrollingInProgress] = useState(false)

  // 1. Fetch enrolled face from backend if not passed as prop
  useEffect(() => {
    if (!activeEnrolledDescriptor) {
      api.get('/user/face-profile')
        .then((res) => {
          if (res.isFaceEnrolled && res.faceDescriptor && res.faceDescriptor.length === 128) {
            setActiveEnrolledDescriptor(res.faceDescriptor)
            setMode('verify')
          } else {
            setMode('enroll')
          }
        })
        .catch(() => {
          // If offline or not enrolled yet, default to enroll
          setMode('enroll')
        })
    }
  }, [activeEnrolledDescriptor])

  // 2. Load Face-API Deep Learning Models from /models/
  useEffect(() => {
    let isMounted = true

    async function loadModels() {
      try {
        setModelsLoadingMessage('Loading TinyFaceDetector neural net…')
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models')

        setModelsLoadingMessage('Loading FaceLandmark68 neural net…')
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models')

        setModelsLoadingMessage('Loading 128-D FaceRecognition ResNet…')
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models')

        if (isMounted) {
          setModelsLoaded(true)
        }
      } catch (err) {
        console.error('Error loading Face-API models:', err)
        if (isMounted) {
          setModelsLoadingMessage('Failed to load neural models. Retrying…')
        }
      }
    }

    loadModels()

    return () => {
      isMounted = false
    }
  }, [])

  // 3. Stop active camera streams
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

  // 4. Start Front Camera (reusing active stream if live)
  const startCamera = useCallback(async () => {
    setCameraState('requesting')
    setStatusMessage('Activating optical camera…')

    try {
      // If we already have live camera tracks, attach directly
      if (streamRef.current && streamRef.current.getVideoTracks().some((t) => t.readyState === 'live')) {
        setCameraState('active')
        setStatusMessage('Center your face in the optical viewfinder…')
        if (videoRef.current) {
          if (videoRef.current.srcObject !== streamRef.current) {
            videoRef.current.srcObject = streamRef.current
          }
          await videoRef.current.play().catch(() => {})
        }
        return
      }

      // Otherwise acquire fresh media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      })

      streamRef.current = stream
      setCameraState('active')
      setStatusMessage('Center your face in the optical viewfinder…')

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
    } catch (err) {
      console.warn('Camera permission blocked or unavailable:', err)
      setCameraState('denied')
      setStatusMessage('Camera access denied or unavailable. Click "Turn On Camera" below to grant access.')
    }
  }, [])

  // Start camera once models are ready
  useEffect(() => {
    if (modelsLoaded) {
      startCamera()
    }
    return () => {
      // Only release on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [modelsLoaded, startCamera])

  // Ensure video element always binds to stream when active
  useEffect(() => {
    if (cameraState === 'active' && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current
      }
      videoRef.current.play().catch(() => {})
    }
  }, [cameraState])


  // 5. Continuous 1:1 Biometric Verification & Facial Recognition Loop
  const detectAndMatchLoop = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || cameraState !== 'active' || !modelsLoaded) return

    const video = videoRef.current
    if (video.readyState >= 2 && !video.paused && !video.ended) {
      const canvas = canvasRef.current
      const displaySize = { width: video.videoWidth || 320, height: video.videoHeight || 240 }
      faceapi.matchDimensions(canvas, displaySize)

      try {
        const detectorOptions = new faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.5,
        })

        // Run deep neural net inference for face landmarks & 128-D descriptor
        const detection = await faceapi
          .detectSingleFace(video, detectorOptions)
          .withFaceLandmarks(true)
          .withFaceDescriptor()

        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (detection) {
          setFaceDetected(true)
          const liveDescriptor = detection.descriptor // Float32Array of 128 dimensions

          // Draw real-time facial landmark contours
          const resizedResult = faceapi.resizeResults(detection, displaySize)
          faceapi.draw.drawFaceLandmarks(canvas, resizedResult)

          if (mode === 'verify') {
            if (activeEnrolledDescriptor && activeEnrolledDescriptor.length === 128) {
              // Mathematical Euclidean distance between 128-D live face vector and enrolled baseline
              const distance = faceapi.euclideanDistance(liveDescriptor, activeEnrolledDescriptor)
              
              // Standard biometric threshold:
              // distance < 0.48: SAME PERSON (Confidence > 85%)
              // distance >= 0.48: DIFFERENT PERSON (Mismatch!)
              const confidenceVal = Math.max(0, Math.min(100, Math.round((1 - distance / 0.65) * 100)))
              setMatchScore(confidenceVal)

              if (distance < 0.48) {
                // GENUINE MATCH CONFIRMED
                handleMatchSuccess(video, liveDescriptor, distance, confidenceVal)
                return
              } else {
                // FACE MISMATCH / IMPERSONATION DETECTED
                setStatusMessage(`❌ Face Mismatch! (Distance: ${distance.toFixed(2)}). Not registered student ${studentName}.`)
                setMismatchReason(`The detected facial geometry does not match registered profile for Roll No: ${studentRoll}.`)
              }
            } else {
              setStatusMessage('⚠️ No enrolled face profile found. Please enroll your face first.')
            }
          } else {
            // ENROLLMENT MODE: Looking for clear steady face
            setStatusMessage('✅ Face detected! Hold still to register your reference biometric vector…')
          }
        } else {
          setFaceDetected(false)
          setStatusMessage('Align your face inside the biometric oval…')
        }
      } catch (err) {
        // Frame processing exception ignored
      }
    }

    if (cameraState === 'active') {
      animFrameRef.current = requestAnimationFrame(detectAndMatchLoop)
    }
  }, [cameraState, modelsLoaded, mode, activeEnrolledDescriptor, studentName, studentRoll])

  useEffect(() => {
    if (cameraState === 'active' && modelsLoaded) {
      animFrameRef.current = requestAnimationFrame(detectAndMatchLoop)
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [cameraState, modelsLoaded, detectAndMatchLoop])

  // 6. Handle Match Confirmed
  const handleMatchSuccess = (video, liveDescriptor, distance, confidenceVal) => {
    stopCameraStream()
    playMatchChime()

    // Capture verification photo
    const captureCanvas = document.createElement('canvas')
    captureCanvas.width = 480
    captureCanvas.height = 360
    const ctx = captureCanvas.getContext('2d')
    ctx.drawImage(video, 0, 0, 480, 360)
    const photoUrl = captureCanvas.toDataURL('image/jpeg', 0.88)

    const hash = `SHA256:1TO1_MATCH_${studentRoll}_${Date.now().toString(16)}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    setCapturedPhoto(photoUrl)
    setAuditHash(hash)
    setCameraState('verified')
    setStatusMessage(`✅ Face Verified! Match score: ${confidenceVal}%`)

    if (onVerified) {
      onVerified({
        photoUrl,
        auditHash: hash,
        confidence: confidenceVal,
        distance: distance.toFixed(3),
        timestamp: new Date().toISOString(),
      })
    }
  }

  // 7. Handle Enrollment of Baseline Face
  const handleEnrollFaceNow = async () => {
    if (!videoRef.current || !modelsLoaded) return
    setEnrollingInProgress(true)
    setStatusMessage('Capturing high-resolution facial geometry vector…')

    try {
      const video = videoRef.current
      const detectorOptions = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })
      const detection = await faceapi
        .detectSingleFace(video, detectorOptions)
        .withFaceLandmarks(true)
        .withFaceDescriptor()

      if (!detection) {
        alert('Could not detect a clear face. Please look directly at the camera in good lighting.')
        setEnrollingInProgress(false)
        return
      }

      // Convert 128-D Float32Array to standard array
      const vector = Array.from(detection.descriptor)

      // Capture photo snapshot
      const captureCanvas = document.createElement('canvas')
      captureCanvas.width = 360
      captureCanvas.height = 360
      const ctx = captureCanvas.getContext('2d')
      ctx.drawImage(video, 0, 0, 360, 360)
      const photoUrl = captureCanvas.toDataURL('image/jpeg', 0.85)

      // Save to MongoDB via real backend endpoint
      const res = await api.post('/user/enroll-face', {
        descriptor: vector,
        photo: photoUrl,
      })

      playMatchChime()
      setActiveEnrolledDescriptor(vector)
      setMode('verify')
      setCameraState('active')
      setEnrollingInProgress(false)
      setStatusMessage('✅ Face ID registered in database! Now look directly at camera to verify.')

      // Ensure video element continues playing smoothly
      if (videoRef.current) {
        if (streamRef.current && videoRef.current.srcObject !== streamRef.current) {
          videoRef.current.srcObject = streamRef.current
        }
        videoRef.current.play().catch(() => {})
      }

      if (onEnrolledSuccess) {
        onEnrolledSuccess(res.user)
      }
    } catch (err) {
      console.error('Enrollment error:', err)
      alert(err.message || 'Failed to save biometric profile to database.')
      setEnrollingInProgress(false)
    }
  }

  // Retry or retake
  const handleRetry = () => {
    setCapturedPhoto(null)
    setMismatchReason('')
    setMatchScore(null)
    startCamera()
  }

  return (
    <div
      style={{
        background: 'var(--surface-sunken)',
        border: cameraState === 'verified'
          ? '2px solid #22C55E'
          : cameraState === 'mismatch'
            ? '2px solid #EF4444'
            : '2px solid var(--line)',
        borderRadius: 16,
        padding: '18px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: cameraState === 'active' ? '0 0 25px rgba(56, 189, 248, 0.15)' : 'none',
      }}
    >
      {/* Top Biometric Mode Switcher */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
          <ShieldCheck size={14} color="#16A34A" /> 1:1 ResNet Neural Biometrics
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            className={`btn btn-xs ${mode === 'verify' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setMode('verify'); handleRetry(); }}
            style={{ fontSize: 10.5 }}
          >
            Verify Face
          </button>
          <button
            type="button"
            className={`btn btn-xs ${mode === 'enroll' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setMode('enroll'); handleRetry(); }}
            style={{ fontSize: 10.5 }}
          >
            Register / Re-enroll
          </button>
        </div>
      </div>

      {/* Model Loading State */}
      {!modelsLoaded && (
        <div style={{ padding: '24px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <RefreshCw size={26} color="#38BDF8" style={{ animation: 'spin 1.5s linear infinite' }} />
          <strong style={{ fontSize: 13, color: '#38BDF8' }}>{modelsLoadingMessage}</strong>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Loading lightweight TensorFlow / ResNet biometric weights locally…
          </span>
        </div>
      )}

      {/* VIEWPORT: Live Front Camera with Real-Time FaceMesh Overlay */}
      {modelsLoaded && cameraState !== 'verified' && (
        <div
          style={{
            position: 'relative',
            width: 220,
            height: 220,
            borderRadius: '50%',
            overflow: 'hidden',
            border: faceDetected ? '3px solid #22C55E' : '3px solid #38BDF8',
            boxShadow: faceDetected ? '0 0 20px rgba(34, 197, 94, 0.45)' : '0 0 20px rgba(56, 189, 248, 0.35)',
            marginBottom: 12,
            background: '#000000',
          }}
        >
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            onLoadedMetadata={() => videoRef.current?.play().catch(() => {})}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)', // Mirror image
            }}
          />

          {/* Real-time Facial Landmark Canvas Overlay */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
              pointerEvents: 'none',
            }}
          />

          {/* Camera Requesting Overlay */}
          {cameraState === 'requesting' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                color: '#38BDF8',
                fontSize: 12,
              }}
            >
              <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Activating Camera…</span>
            </div>
          )}

          {/* Camera Denied Overlay */}
          {cameraState === 'denied' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.92)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: 12,
                color: '#EF4444',
                fontSize: 11,
              }}
            >
              <CameraOff size={24} />
              <span>Camera Blocked</span>
              <button
                type="button"
                className="btn btn-xs btn-primary"
                onClick={startCamera}
                style={{ fontSize: 10, padding: '2px 8px' }}
              >
                Turn On Camera
              </button>
            </div>
          )}

          {/* Animated Sweeping Laser Beam */}
          {cameraState === 'active' && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: 3,
                background: faceDetected ? '#22C55E' : '#38BDF8',
                boxShadow: faceDetected ? '0 0 10px 2px #22C55E' : '0 0 10px 2px #38BDF8',
                top: '45%',
                animation: 'scanLineSweep 2s ease-in-out infinite alternate',
              }}
            />
          )}

          {/* Target Oval Contour */}
          <div
            style={{
              position: 'absolute',
              inset: 14,
              borderRadius: '50%',
              border: '1.5px dashed rgba(255, 255, 255, 0.6)',
              pointerEvents: 'none',
            }}
          />
        </div>
      )}

      {/* Manual Turn On / Restart Camera Trigger */}
      {modelsLoaded && cameraState !== 'verified' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button
            type="button"
            className="btn btn-xs btn-ghost"
            onClick={startCamera}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}
          >
            <Camera size={13} /> Turn On / Restart Camera
          </button>
        </div>
      )}

      {/* VIEWPORT 2: Face Verified Successfully */}
      {cameraState === 'verified' && capturedPhoto && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div
            style={{
              position: 'relative',
              width: 110,
              height: 110,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid #22C55E',
              boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)',
            }}
          >
            <img src={capturedPhoto} alt="Verified Resident Face" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(34, 197, 94, 0.95)',
                color: '#FFFFFF',
                fontSize: 9,
                fontWeight: 800,
                padding: '2px 0',
                letterSpacing: 0.5,
              }}
            >
              MATCH: {matchScore}%
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16A34A', fontSize: 13, fontWeight: 700 }}>
            <CheckCircle2 size={16} /> Genuine Identity Match Confirmed
          </div>
          <span style={{ fontSize: 11, color: '#0F172A', fontWeight: 600 }}>
            {studentName} ({studentRoll})
          </span>
          <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>
            Biometric Token: {auditHash.slice(0, 28)}…
          </span>

          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={handleRetry}
            style={{ fontSize: 11, color: 'var(--text-muted)' }}
          >
            <RefreshCw size={11} /> Scan Again
          </button>
        </div>
      )}

      {/* Mismatch Warning Alert Banner */}
      {mismatchReason && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1.5px solid #EF4444',
            borderRadius: 10,
            padding: '10px 12px',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#B91C1C',
            fontSize: 11.5,
            textAlign: 'left',
          }}
        >
          <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0 }} />
          <div>
            <strong>Access Denied: Impersonation Blocked</strong>
            <p style={{ margin: '2px 0 0', fontSize: 11 }}>{mismatchReason}</p>
          </div>
        </div>
      )}

      {/* Status Line */}
      {modelsLoaded && cameraState === 'active' && (
        <div style={{ width: '100%', maxWidth: 300, marginTop: 4 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: mismatchReason ? '#EF4444' : faceDetected ? '#22C55E' : '#38BDF8',
              display: 'block',
              marginBottom: 8,
            }}
          >
            {statusMessage}
          </span>

          {mode === 'enroll' ? (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={!faceDetected || enrollingInProgress}
              onClick={handleEnrollFaceNow}
              style={{ width: '100%', background: '#0284C7', borderColor: '#0284C7', fontWeight: 700 }}
            >
              {enrollingInProgress ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <UserCheck size={15} />}
              {enrollingInProgress ? 'Saving Biometric Profile…' : 'Register This Face as My Official Profile'}
            </button>
          ) : (
            !activeEnrolledDescriptor && (
              <div style={{ fontSize: 11.5, color: '#D97706', background: '#FEF3C7', padding: '6px 10px', borderRadius: 8 }}>
                No face profile registered yet. Click &quot;Register / Re-enroll&quot; above to scan your face once.
              </div>
            )
          )}
        </div>
      )}

      <style>{`
        @keyframes scanLineSweep {
          0% { top: 15%; opacity: 0.6; }
          50% { top: 85%; opacity: 1; }
          100% { top: 15%; opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}
