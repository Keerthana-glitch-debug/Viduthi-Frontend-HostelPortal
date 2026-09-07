import { Link } from 'react-router-dom'
import { KeyRound } from 'lucide-react'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
      background: 'var(--bg)',
      color: 'var(--ink)',
      textAlign: 'center',
      padding: 24,
    }}>
      <div className="brand-mark" style={{ width: 52, height: 52, borderRadius: 16 }}>
        <KeyRound size={24} />
      </div>
      <h1 style={{ fontSize: 24, fontFamily: 'var(--font-display)' }}>This tag isn't on the rack</h1>
      <p style={{ color: 'var(--ink-soft)', maxWidth: 340, fontSize: 13.5 }}>
        The page you're looking for doesn't exist, or has been moved to a different hook.
      </p>
      <Link to="/app" className="btn btn-primary" style={{ marginTop: 8 }}>Back to the register</Link>
    </div>
  )
}
