import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Moon, Sun, CheckCircle2, Palette, PanelLeftClose, Keyboard, Type,
  Globe, Check, Wand2, PawPrint, Circle, ShieldCheck, Lock, KeyRound,
} from 'lucide-react'
import { selectUi, toggleTheme, setButtonSkin, setFontTheme, setAccentColor, setBackgroundTheme, setLanguage, pushToast } from '../store/slices/uiSlice'
import { selectUser } from '../store/slices/authSlice'
import { api } from '../api/client'
import { LANGUAGES } from '../i18n/translations'
import useTranslation from '../hooks/useTranslation'

const FONT_OPTIONS = [
  { id: 'rounded', family: "'Baloo 2', sans-serif", labelKey: 'settings_font_rounded' },
  { id: 'classic', family: "'Space Grotesk', sans-serif", labelKey: 'settings_font_classic' },
  { id: 'serif', family: "'Fraunces', serif", labelKey: 'settings_font_serif' },
  { id: 'modern', family: "'Poppins', sans-serif", labelKey: 'settings_font_modern' },
  { id: 'elegant', family: "'Playfair Display', serif", labelKey: 'settings_font_elegant' },
  { id: 'playful', family: "'Quicksand', sans-serif", labelKey: 'settings_font_playful' },
]

const ACCENT_OPTIONS = [
  { id: 'leaf', label: 'Leafy Green (#7CFC00)', swatch: '#7CFC00' },
  { id: 'emerald', label: 'Emerald Green', swatch: '#10B981' },
  { id: 'forest', label: 'Forest Green', swatch: '#2E7D32' },
  { id: 'mint', label: 'Fresh Mint', swatch: '#34D399' },
  { id: 'pink', label: 'Blossom Pink', swatch: '#EC4899' },
  { id: 'purple', label: 'Royal Purple', swatch: '#8B5CF6' },
  { id: 'slate', label: 'Modern Slate', swatch: '#334155' },
  { id: 'sky', label: 'Sky Blue', swatch: '#0EA5E9' },
  { id: 'teal', label: 'Teal Calm', swatch: '#14B8A6' },
  { id: 'amber', label: 'Warm Amber', swatch: '#F59E0B' },
]

const BACKGROUND_OPTIONS = [
  { id: 'none', label: 'Clean / None', icon: Circle },
  { id: 'bubbles', label: 'Soft Bubbles', icon: Wand2 },
  { id: 'pawprints', label: 'Subtle Geometry', icon: PawPrint },
]

export default function Settings() {
  const dispatch = useDispatch()
  const { isDark, buttonSkin, fontTheme, accentColor, backgroundTheme, language } = useSelector(selectUi)
  const user = useSelector(selectUser)
  const { t } = useTranslation()

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) {
      dispatch(pushToast('Please enter both current and new passwords.', 'warn'))
      return
    }
    if (newPassword !== confirmPassword) {
      dispatch(pushToast('New password and confirmation do not match.', 'bad'))
      return
    }
    if (newPassword.length < 3) {
      dispatch(pushToast('Password must be at least 3 characters long.', 'warn'))
      return
    }

    setIsSavingPassword(true)
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
        identifier: user.rollNo || user.email || user.staffId,
      })

      if (res && res.success) {
        dispatch(pushToast('Password updated successfully! Keep your new password safe.', 'ok'))
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        throw new Error(res?.message || 'Failed to update password.')
      }
    } catch (err) {
      console.error('[Change Password Error]', err)
      const msg = err.data?.message || err.message || 'Failed to update password. Verify current password.'
      dispatch(pushToast(`Password Update Failed: ${msg}`, 'bad'))
    } finally {
      setIsSavingPassword(false)
    }
  }

  const chooseSkin = (skin) => {
    dispatch(setButtonSkin(skin))
    dispatch(pushToast(skin === 'outline' ? 'Switched to clean outline buttons' : 'Switched to classic solid buttons', 'ok'))
  }

  const chooseAccent = (color, label) => {
    dispatch(setAccentColor(color))
    dispatch(pushToast(`Accent color set to ${label}`, 'ok'))
  }

  const chooseBackground = (theme, label) => {
    dispatch(setBackgroundTheme(theme))
    dispatch(pushToast(theme === 'none' ? 'Background decorations off' : `${label} background activated`, 'ok'))
  }

  const chooseFont = (font) => {
    dispatch(setFontTheme(font))
    try {
      document.documentElement.setAttribute('data-font', font)
      document.body.setAttribute('data-font', font)
    } catch { /* no-op */ }
    dispatch(pushToast('Font style updated', 'info'))
  }

  const chooseLanguage = (lang) => {
    dispatch(setLanguage(lang))
    dispatch(pushToast(lang === 'ta' ? 'மொழி தமிழுக்கு மாற்றப்பட்டது' : 'Language switched to English', 'info'))
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Hostel System Preferences</span>
          <h1>Settings &amp; Personalization</h1>
        </div>
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3><Palette size={15} style={{ verticalAlign: -2, marginRight: 6 }} />{t('settings_appearance')}</h3>
              <p>{t('settings_appearance_desc')}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="settings-row">
              <div>
                <div className="settings-row-title">{isDark ? <Moon size={15} /> : <Sun size={15} />} {t('settings_theme')}</div>
                <p className="settings-row-desc">{t('settings_theme_desc')}</p>
              </div>
              <button className="btn btn-blue btn-sm" onClick={() => dispatch(toggleTheme())}>
                {isDark ? t('settings_theme_day') : t('settings_theme_night')}
              </button>
            </div>

            <div className="settings-row settings-row-column">
              <div>
                <div className="settings-row-title"><Palette size={15} /> Accent color</div>
                <p className="settings-row-desc">Pick the main color used for buttons and highlights across the app.</p>
              </div>
              <div className="color-picker">
                {ACCENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    className={`color-swatch ${accentColor === opt.id ? 'is-selected' : ''}`}
                    style={{ background: opt.swatch }}
                    onClick={() => chooseAccent(opt.id, opt.label)}
                    aria-label={opt.label}
                    title={opt.label}
                  >
                    {accentColor === opt.id && (
                      <Check size={16} color={['leaf', 'mint'].includes(opt.id) ? '#0B2504' : '#ffffff'} strokeWidth={3} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-row settings-row-column">
              <div>
                <div className="settings-row-title"><Palette size={15} /> Button style</div>
                <p className="settings-row-desc">Choose between classic solid accent buttons or clean minimal outline buttons.</p>
              </div>
              <div className="skin-picker">
                <button
                  className={`skin-option ${buttonSkin === 'solid' ? 'is-selected' : ''}`}
                  onClick={() => chooseSkin('solid')}
                >
                  <span className="btn btn-primary btn-sm skin-preview" style={{ pointerEvents: 'none' }}>Solid</span>
                  Classic Solid
                </button>
                <button
                  className={`skin-option ${buttonSkin === 'outline' ? 'is-selected' : ''}`}
                  onClick={() => chooseSkin('outline')}
                >
                  <span className="btn btn-ghost btn-sm skin-preview" style={{ pointerEvents: 'none', borderColor: 'var(--accent-border)' }}>Outline</span>
                  Clean Outline
                </button>
              </div>
            </div>

            <div className="settings-row settings-row-column">
              <div>
                <div className="settings-row-title"><Wand2 size={15} /> Background style</div>
                <p className="settings-row-desc">Subtle distraction-free background styling across the app.</p>
              </div>
              <div className="skin-picker">
                {BACKGROUND_OPTIONS.map((opt) => {
                  const Icon = opt.icon
                  return (
                    <button
                      key={opt.id}
                      className={`skin-option ${backgroundTheme === opt.id ? 'is-selected' : ''}`}
                      onClick={() => chooseBackground(opt.id, opt.label)}
                    >
                      <span className="font-preview"><Icon size={20} /></span>
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="settings-row settings-row-column">
              <div>
                <div className="settings-row-title"><Type size={15} /> {t('settings_font')}</div>
                <p className="settings-row-desc">{t('settings_font_desc')}</p>
              </div>
              <div className="skin-picker">
                {FONT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    className={`skin-option ${fontTheme === opt.id ? 'is-selected' : ''}`}
                    onClick={() => chooseFont(opt.id)}
                  >
                    <span className="font-preview" style={{ fontFamily: opt.family }}>Aa</span>
                    {t(opt.labelKey)}
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-row settings-row-column">
              <div>
                <div className="settings-row-title"><Globe size={15} /> {t('settings_language')}</div>
                <p className="settings-row-desc">{t('settings_language_desc')}</p>
              </div>
              <div className="skin-picker">
                {Object.entries(LANGUAGES).map(([code, meta]) => (
                  <button
                    key={code}
                    className={`skin-option ${language === code ? 'is-selected' : ''}`}
                    onClick={() => chooseLanguage(code)}
                  >
                    <span className="font-preview">{meta.native}</span>
                    {meta.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECURITY & CHANGE PASSWORD */}
        <div className="panel" style={{ border: '1.5px solid var(--accent-border)' }}>
          <div className="panel-head">
            <div>
              <h3>
                <Lock size={15} style={{ verticalAlign: -2, marginRight: 6, color: 'var(--accent-border)' }} />
                Security &amp; Change Password
              </h3>
              <p>Update your account password securely.</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label>Current Password</label>
              <input
                type="password"
                required
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div>
                <label>New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new secret password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label>Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSavingPassword}
                style={{ padding: '8px 20px' }}
              >
                <Lock size={14} />
                <span>{isSavingPassword ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3><ShieldCheck size={15} style={{ verticalAlign: -2, marginRight: 6, color: 'var(--accent-green)' }} />Portal &amp; Data Preferences</h3>
              <p>Device preferences, offline data cache, and campus session security</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="settings-row">
              <div>
                <div className="settings-row-title">Offline SOS Local Cache</div>
                <p className="settings-row-desc">Emergency beacon requests are safely backed up in device storage even when disconnected from campus Wi-Fi.</p>
              </div>
              <span className="badge badge-ok">Active &amp; Ready</span>
            </div>

            <div className="settings-row">
              <div>
                <div className="settings-row-title">Session Persistence</div>
                <p className="settings-row-desc">Keeps your active role, theme preferences, and credentials secured across browser reloads.</p>
              </div>
              <span className="badge badge-info">Persistent</span>
            </div>

            <div className="settings-row">
              <div>
                <div className="settings-row-title">Data Hygiene &amp; Cache</div>
                <p className="settings-row-desc">Clear offline operational cache and synchronize local records.</p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  try {
                    localStorage.removeItem('vidudhi:offline_sos_queue')
                  } catch (e) {
                    console.error(e)
                  }
                  dispatch(pushToast('Local emergency cache refreshed.', 'ok'))
                }}
              >
                Refresh Cache
              </button>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 14, borderRadius: 8, border: '1px solid var(--line-weak)', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>System Architecture</div>
              <div style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Vidudhi Residential Portal · Release v2.4 (React 18 + Redux Toolkit)<br />
                Campus Identity &amp; Facilities Subsystem
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
