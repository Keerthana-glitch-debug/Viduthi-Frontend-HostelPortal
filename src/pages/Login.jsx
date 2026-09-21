import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, DoorOpen, ArrowRight, Phone, ShieldAlert, UserCog, Sparkles } from 'lucide-react'
import { login } from '../store/slices/authSlice'
import { selectUi, pushToast } from '../store/slices/uiSlice'
import useTranslation from '../hooks/useTranslation'
import brandLogo from '../assets/brand-logo.jpg'
import './Login.css'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { buttonSkin, fontTheme, accentColor } = useSelector(selectUi)
  const { t } = useTranslation()
  const [role, setRole] = useState('student')
  const [id, setId] = useState('24104031')
  const [password, setPassword] = useState('password123')

  const handleRoleSelect = (newRole) => {
    setRole(newRole)
    if (newRole === 'student') {
      setId('24104031')
    } else if (newRole === 'warden') {
      setId('WRD-1001')
    } else if (newRole === 'admin') {
      setId('ADM-0001')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(login(role))
    const roleTitles = {
      student: 'Welcome back, Keerthana!',
      warden: 'Welcome to Warden Command Center, Dr. Sundaram.',
      admin: 'Welcome to Administrative Console, Prof. Venkatesh.',
    }
    dispatch(pushToast(roleTitles[role] || 'Welcome back!', 'ok'))
    navigate('/app')
  }

  return (
    <div className={`login-page-container font-${fontTheme} accent-${accentColor} skin-${buttonSkin}`}>
      <div className="login-backdrop-overlay" />

      <div className="login-content-box">
        {/* Hostel Branding with small refined crest logo */}
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
              alt="Vidudhi Logo"
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

        {/* Centered Login Card */}
        <div className="login-card">
          <div className="login-card-header">
            <h2>Sign in to your account</h2>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {/* 3 Strict Roles Selector */}
            <div className="role-toggle role-toggle-three">
              <button
                type="button"
                className={role === 'student' ? 'is-active' : ''}
                onClick={() => handleRoleSelect('student')}
              >
                <DoorOpen size={15} /> Student
              </button>
              <button
                type="button"
                className={role === 'warden' ? 'is-active' : ''}
                onClick={() => handleRoleSelect('warden')}
              >
                <ShieldCheck size={15} /> Warden
              </button>
              <button
                type="button"
                className={role === 'admin' ? 'is-active' : ''}
                onClick={() => handleRoleSelect('admin')}
              >
                <UserCog size={15} /> Admin
              </button>
            </div>

            <div className="form-field">
              <label>
                {role === 'student' ? 'Student Roll Number' : role === 'warden' ? 'Warden Staff ID' : 'Administrator ID'}
              </label>
              <input
                type="text"
                required
                placeholder={role === 'student' ? '24104031' : role === 'warden' ? 'WRD-1001' : 'ADM-0001'}
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary login-submit">
              <span>Sign In to Portal</span>
              <ArrowRight size={15} />
            </button>
          </form>
        </div>

        {/* Bottom emergency & contact strip without any 24/7 wording */}
        <div className="login-page-footer">
          <span><Phone size={12} /> Campus Control Desk: +91 94440 01100</span>
          <span className="login-footer-dot">·</span>
          <span><ShieldAlert size={12} /> Security &amp; Medical Emergency Network Active</span>
        </div>
      </div>
    </div>
  )
}
