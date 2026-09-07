export default function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="empty-state">
      {Icon && <Icon size={26} strokeWidth={1.6} />}
      <h4>{title}</h4>
      <p>{message}</p>
    </div>
  )
}
