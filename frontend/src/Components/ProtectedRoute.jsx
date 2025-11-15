import { Navigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { session } = UserAuth()

  // While checking auth status
  if (session === undefined) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    )
  }

  // If authenticated, show the protected content
  // If not, redirect to sign in
  return session ? children : <Navigate to="/signin" />
}