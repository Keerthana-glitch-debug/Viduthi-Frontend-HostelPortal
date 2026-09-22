import { useRef } from 'react'
import { X } from 'lucide-react'
import useKeyPress from '../../hooks/useKeyPress'
import useOnClickOutside from '../../hooks/useOnClickOutside'
import './Modal.css'

export default function Modal({ title, subtitle, onClose, children, footer }) {
  const panelRef = useRef(null)

  useKeyPress('Escape', onClose)
  useOnClickOutside(panelRef, onClose)

  return (
    <div className="modal-backdrop">
      <div className="modal-panel" ref={panelRef}>
        <div className="modal-head">
          <div>
            <h3>{title}</h3>
            {subtitle && <p className="modal-subtitle">{subtitle}</p>}
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
