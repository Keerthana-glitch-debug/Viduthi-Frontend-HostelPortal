import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { KeyRound, ShieldCheck, DoorOpen, ArrowRight, Phone, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { login } from '../store/slices/authSlice'
import { selectUi, pushToast } from '../store/slices/uiSlice'
import useTranslation from '../hooks/useTranslation'
import './Login.css'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { buttonSkin, fontTheme, accentColor } = useSelector(selectUi)
  const { t } = useTranslation()
  const [role, setRole] = useState('resident')
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(login(role))
    dispatch(pushToast(role === 'admin' ? 'Welcome back, Warden.' : 'Welcome back!', 'ok'))
    navigate('/app')
  }

  return (
    <div className={`login-page-container font-${fontTheme} accent-${accentColor} skin-${buttonSkin}`}>
      <div className="login-backdrop-overlay" />

      <div className="login-content-box">
        {/* Hostel Branding directly on top of the login portion */}
        <div className="login-brand-header">
          <div className="login-brand-logo">
            <KeyRound size={28} strokeWidth={2.2} />
          </div>
          <h1 className="login-brand-title">Vidhuthi</h1>
          <p className="login-brand-subtitle">Student Residence &amp; Campus Living Portal</p>
        </div>

        {/* Centered Login Card */}
        <div className="login-card">
          <div className="login-card-header">
            <span className="login-card-eyebrow">PORTAL ACCESS</span>
            <h2>Sign in to your account</h2>
            <p className="login-card-desc">Select your role to access your room and campus facilities</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="role-toggle">
              <button
                type="button"
                className={role === 'resident' ? 'is-active' : ''}
                onClick={() => setRole('resident')}
              >
                <DoorOpen size={16} /> Resident
              </button>
              <button
                type="button"
                className={role === 'admin' ? 'is-active' : ''}
                onClick={() => setRole('admin')}
              >
                <ShieldCheck size={16} /> Warden
              </button>
            </div>

            <div className="form-field">
              <label>{role === 'admin' ? 'Staff ID' : 'Roll Number / Register No.'}</label>
              <input
                type="text"
                placeholder={role === 'admin' ? 'e.g. STF-0042' : 'e.g. 24104031'}
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary login-submit">
              <span>Continue as {role === 'admin' ? 'Warden' : 'Resident'}</span>
              <ArrowRight size={15} />
            </button>

            <div className="login-demo-hint">
              <CheckCircle2 size={13} color="var(--accent-border)" />
              <span>Demo login enabled — tap continue with any credentials</span>
            </div>
          </form>
        </div>

        {/* Bottom emergency & contact strip */}
        <div className="login-page-footer">
          <span><Phone size={12} /> Campus Control Desk: +91 94440 01100</span>
          <span className="login-footer-dot">·</span>
          <span><ShieldAlert size={12} /> 24/7 Security &amp; Medical SOS Active</span>
        </div>
      </div>
    </div>
  )
}
