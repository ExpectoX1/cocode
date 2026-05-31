import { Navigate } from 'react-router-dom'
import { getToken } from '../lib/auth'

export default function GuestRoute({
  children,
}: {
  children: React.ReactNode
}) {
  if (getToken()) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}
