import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSignIn = (e) => {
    e.preventDefault()
    // Add authentication logic here
    console.log('Sign in:', email, password)
    navigate('/')
  }

  const handleCancel = () => {
    navigate('/')
  }

  return (
    <main className="main-content">
      <div className="signin-container">
        <div className="signin-box">
          <h2 className="signin-title">User Sign In</h2>
          
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

            <div className="signin-buttons">
              <button type="button" onClick={handleCancel} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="signin-btn">
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

export default SignIn