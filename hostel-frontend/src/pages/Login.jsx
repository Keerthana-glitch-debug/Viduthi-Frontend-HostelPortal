import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  DoorOpen,
  ArrowRight,
  Phone,
  ShieldAlert,
  UserCog,
  AlertCircle,
  UtensilsCrossed,
  HeartPulse,
} from 'lucide-react'
import { login, updateUserProfile } from '../store/slices/authSlice'
import { selectUi, pushToast } from '../store/slices/uiSlice'
import brandLogo from '../assets/brand-logo.jpg'
import { api } from '../api/client'
import './Login.css'

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '953880868649-mopb50m92ocgpvm512va4kecm4slo96b.apps.googleusercontent.com'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { buttonSkin, fontTheme, accentColor } = useSelector(selectUi)

  // Sign In State
  const [role, setRole] = useState('student')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState(null)

  const googleBtnRef = useRef(null)

  // Initialize Real Google Identity Services (GIS) on Mount
  useEffect(() => {
    const initGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          })

          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = ''
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              width: 360,
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left',
            })
          }
        } catch (err) {
          console.warn('[Google GIS]', err)
        }
      }
    }

    if (!window.google?.accounts?.id) {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initGsi
      document.head.appendChild(script)
    } else {
      initGsi()
    }
  }, [])

  // Real Google OAuth Credential Handler (Verified with MongoDB Atlas)
  const handleGoogleCredentialResponse = async (googleResponse) => {
    setIsLoading(true)
    setAuthError(null)

    try {
      if (!googleResponse || !googleResponse.credential) {
        throw new Error('No Google token received from browser prompt.')
      }

      // Cryptographically checks token with Google & verifies against MongoDB Atlas
      const res = await api.post('/auth/google', {
        credential: googleResponse.credential,
        client_id: GOOGLE_CLIENT_ID,
      })

      if (res && res.success && res.token) {
        window.localStorage.setItem('vidudhi:jwt_token', res.token)
        window.localStorage.setItem('vidudhi:user_role', res.user.role)

        dispatch(updateUserProfile({ role: res.user.role, updates: res.user }))
        dispatch(login(res.user.role))
        dispatch(pushToast(`Welcome, ${res.user.name}! Authenticated with Google & MongoDB.`, 'ok'))
        navigate('/app')
      } else {
        throw new Error(res?.message || 'Access denied by database policy.')
      }
    } catch (err) {
      console.error('[Google Login Error]', err)
      const errorMsg =
        err.data?.message || err.message || 'Google account not authorized in database.'
      setAuthError(errorMsg)
      dispatch(pushToast(`Access Denied: ${errorMsg}`, 'danger'))
    } finally {
      setIsLoading(false)
    }
  }

  // Standard Login (ID / Email + Password)
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setAuthError(null)

    try {
      const res = await api.post('/auth/login', {
        identifier: identifier.trim(),
        password,
      })

      if (res && res.success && res.token) {
        window.localStorage.setItem('vidudhi:jwt_token', res.token)
        window.localStorage.setItem('vidudhi:user_role', res.user.role)

        dispatch(updateUserProfile({ role: res.user.role, updates: res.user }))
        dispatch(login(res.user.role))
        dispatch(pushToast(`Welcome back, ${res.user.name}!`, 'ok'))
        navigate('/app')
      } else {
        throw new Error(res?.message || 'Authentication failed.')
      }
    } catch (err) {
      console.error('[Login Error]', err)
      const errorMsg =
        err.data?.message || err.message || 'Invalid credentials. Please verify your ID and password.'
      setAuthError(errorMsg)
      dispatch(pushToast(`Login Failed: ${errorMsg}`, 'danger'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`login-page-container font-${fontTheme} accent-${accentColor} skin-${buttonSkin}`}>
      <div className="login-backdrop-overlay" />

      <div className="login-content-box">
        {/* Hostel Crest & Branding */}
        <div className="login-brand-header">
          <div
            className="login-brand-logo"
            aria-hidden="true"
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              overflow: 'hidden',
              padding: 0,
              border: '2px solid var(--accent-border, #7CFC00)',
              boxShadow: '0 4px 16px rgba(124, 252, 0, 0.25)',
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={brandLogo}
              alt="Vidudhi Crest"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                if (e.currentTarget.nextSibling) {
                  e.currentTarget.nextSibling.style.display = 'block'
                }
              }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <DoorOpen size={24} color="var(--accent-border)" style={{ display: 'none' }} />
          </div>
          <h1 className="login-brand-title">Vidudhi</h1>
          <p className="login-brand-subtitle">
            Smart Residence &amp; Campus Living Platform
          </p>
        </div>

        {/* Centered Sign-In Card */}
        <div className="login-card">
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>Sign in to your account</h2>
            <p style={{ fontSize: 12, color: 'var(--ink-muted)', margin: 0 }}>
              Access restricted to authorized hostel residents and staff
            </p>
          </div>

          {/* Authentication Error Banner */}
          {authError && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 8,
                padding: '10px 12px',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                color: '#ef4444',
                fontSize: 12.5,
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <strong>Access Denied:</strong>
                <div style={{ marginTop: 2 }}>{authError}</div>
              </div>
            </div>
          )}

          <form className="login-form" onSubmit={handleLoginSubmit}>
            {/* Role Selector — 5 Authentic Roles */}
            <div className="role-toggle role-toggle-five">
              <button
                type="button"
                className={role === 'student' ? 'is-active' : ''}
                onClick={() => { setRole('student'); setAuthError(null); }}
              >
                <DoorOpen size={13} /> Student
              </button>
              <button
                type="button"
                className={role === 'warden' ? 'is-active' : ''}
                onClick={() => { setRole('warden'); setAuthError(null); }}
              >
                <ShieldCheck size={13} /> Warden
              </button>
              <button
                type="button"
                className={role === 'admin' ? 'is-active' : ''}
                onClick={() => { setRole('admin'); setAuthError(null); }}
              >
                <UserCog size={13} /> Admin
              </button>
              <button
                type="button"
                className={role === 'mess_manager' ? 'is-active' : ''}
                onClick={() => { setRole('mess_manager'); setAuthError(null); }}
              >
                <UtensilsCrossed size={13} /> Mess Mgr
              </button>
              <button
                type="button"
                className={role === 'doctor' ? 'is-active' : ''}
                onClick={() => { setRole('doctor'); setAuthError(null); }}
              >
                <HeartPulse size={13} /> Doctor
              </button>
            </div>

            <div className="form-field">
              <label>
                {role === 'student'
                  ? 'Roll No / Email'
                  : role === 'warden'
                  ? 'Staff ID / Email'
                  : role === 'admin'
                  ? 'Admin ID / Email'
                  : role === 'mess_manager'
                  ? 'Mess Staff ID / Email'
                  : 'Doctor ID / Email'}
              </label>
              <input
                type="text"
                required
                placeholder={
                  role === 'student'
                    ? 'Enter Roll Number or Email'
                    : role === 'warden'
                    ? 'Enter Staff ID or Email'
                    : role === 'admin'
                    ? 'Enter Admin ID or Email'
                    : role === 'mess_manager'
                    ? 'Enter Mess Staff ID or Email'
                    : 'Enter Doctor ID or Email'
                }
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setAuthError(null); }}
              />
            </div>

            <div className="form-field">
              <label>Password</label>
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setAuthError(null); }}
              />
            </div>

            <button type="submit" className="btn btn-primary login-submit" disabled={isLoading}>
              <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight size={15} />
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }}></div>
              <span style={{ fontSize: 11, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }}></div>
            </div>

            {/* Real Official Google Sign-In Container */}
            <div
              ref={googleBtnRef}
              id="officialGoogleSignInBtn"
              style={{
                display: 'flex',
                justifyContent: 'center',
                minHeight: 44,
                width: '100%',
              }}
            />
          </form>
        </div>

        {/* Campus emergency strip */}
        <div className="login-page-footer">
          <span><Phone size={12} /> Campus Desk: +91 94440 01100</span>
          <span className="login-footer-dot">·</span>
          <span><ShieldAlert size={12} /> Security &amp; Medical Network Active</span>
        </div>
      </div>
    </div>
  )
}
