import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { selectToasts, selectUi, dismissToast } from '../../store/slices/uiSlice'
import './Toast.css'

const ICONS = { ok: CheckCircle2, warn: AlertTriangle, info: Info }

function ToastItem({ toast }) {
  const dispatch = useDispatch()
  const Icon = ICONS[toast.tone] || Info

  useEffect(() => {
    const timer = setTimeout(() => dispatch(dismissToast(toast.id)), 3800)
    return () => clearTimeout(timer)
  }, [toast.id, dispatch])

  return (
    <div className={`toast toast-${toast.tone}`}>
      <Icon size={16} />
      <span>{toast.message}</span>
      <button onClick={() => dispatch(dismissToast(toast.id))} aria-label="Dismiss">
        <X size={13} />
      </button>
    </div>
  )
}

export default function ToastStack() {
  const toasts = useSelector(selectToasts)
  const { sidebarCollapsed } = useSelector(selectUi)
  if (!toasts.length) return null
  return (
    <div className={`toast-stack ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
    </div>
  )
}
