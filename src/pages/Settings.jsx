import { useDispatch, useSelector } from 'react-redux'
import { Moon, Sun, CheckCircle2, Palette, PanelLeftClose, Keyboard, Type, Globe, Check, Wand2, PawPrint, Circle } from 'lucide-react'
import { selectUi, toggleTheme, setButtonSkin, setFontTheme, setAccentColor, setBackgroundTheme, setLanguage, pushToast } from '../store/slices/uiSlice'
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
  const { t } = useTranslation()

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
          <span className="eyebrow">{t('settings_eyebrow')}</span>
          <h1>{t('settings_title')}</h1>
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

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3><Keyboard size={15} style={{ verticalAlign: -2, marginRight: 6 }} />{t('settings_shortcuts')}</h3>
              <p>{t('settings_shortcuts_desc')}</p>
            </div>
          </div>
          <div className="shortcut-list">
            <div className="shortcut-row"><kbd>⌘K</kbd><span>{t('shortcut_palette')}</span></div>
            <div className="shortcut-row"><kbd>/</kbd><span>{t('shortcut_search')}</span></div>
            <div className="shortcut-row"><kbd>Esc</kbd><span>{t('shortcut_esc')}</span></div>
            <div className="shortcut-row"><PanelLeftClose size={14} /><span>{t('shortcut_sidebar')}</span></div>
            <div className="shortcut-row"><CheckCircle2 size={14} /><span>{t('shortcut_toast')}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
