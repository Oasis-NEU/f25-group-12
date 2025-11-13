import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'

function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()
  const { signUpNewUser } = UserAuth()

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    // THIS IS THE IMPORTANT PART, Call Supabase
    const result = await signUpNewUser(email, password, { 
      full_name: fullName 
    })
    
    setLoading(false)

    if (result.success) {
      alert('Success! Check your email to verify your account.')
      navigate('/signin')
    } else {
      setError(result.error?.message || 'Sign up failed')
    }
  }

  const handleCancel = () => {
    navigate('/')
  }

  return (
    <main className="main-content">
      <div className="signin-container">
        <div className="signin-box">
          <h2 className="signin-title">Create Account</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSignUp}>
            <div className="form-group">
              <label htmlFor="fullName">full name:</label>
              <input
                type="text"
                id="fullName"
                placeholder="e.g. John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

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
                placeholder="minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">confirm password:</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
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
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>
          </form>

          <p className="signin-link">
            Already have an account? <a href="/signin">Sign In</a>
          </p>
        </div>
      </div>
    </main>
  )
}

export default SignUp