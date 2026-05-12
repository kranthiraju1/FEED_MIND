import { useEffect } from 'react'

export default function AdminRoute({ role, navigate, children }) {
  useEffect(() => {
    if (role !== 'admin') {
      navigate('/login')
    }
  }, [role, navigate])

  if (role !== 'admin') {
    return null
  }

  return <>{children}</>
}
