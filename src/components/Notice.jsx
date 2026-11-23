import { CircleAlert, Compass, LoaderCircle } from 'lucide-react'

export default function Notice({ type = 'empty', heading: Heading = 'h2', title, children, action }) {
  const Icon = { loading: LoaderCircle, error: CircleAlert, empty: Compass }[type]

  return (
    <div className={`notice notice--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span className="notice-icon"><Icon size={23} aria-hidden="true" /></span>
      <Heading>{title}</Heading>
      {children && <p>{children}</p>}
      {action}
    </div>
  )
}
