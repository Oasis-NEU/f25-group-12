import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'

function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()
  const { signInUser } = UserAuth()

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signInUser(email, password)
    
    setLoading(false)

    if (result.success) {
      navigate('/')
    } else {
      setError(result.error)
    }
  }

  const handleCancel = () => {
    navigate('/')
  }

  return (
    <main className="main-content">
      <div className="signin-container">
        <div className="signin-box">
          <h2 className="signin-title">User Sign In</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSignIn}>
            <div className="form-group">
              <label htmlFor="email">email:</label>
              <input
                type="email"
                id="email"
                placeholder="e.g. example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">password:</label>
              <input
                type="password"
                id="password"
                placeholder="e.g. password123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="signup-button">
              <nav className="nav">
                <Link to="/signup" className="nav-link" class="text-blue">Sign Up</Link>
              </nav>
            </div>

            <div className="signin-buttons">
              <button 
                type="button" 
                onClick={handleCancel} 
                className="cancel-btn"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="signin-btn"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
            
            <p className="signin-link">
              Don't have an account? <a href="/signup">Sign Up</a>
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}

export default SignIn