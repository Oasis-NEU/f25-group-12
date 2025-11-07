import { Link, useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'

function Header() {
  const navigate = useNavigate()
  const { session, signOut } = UserAuth()

  const handleProfileClick = () => {
    if (session) {
      navigate('/profile')
    } else {
      navigate('/signin')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-nav">
          <img src="/Maintenance Reporter Thin Variant.png" alt="Logo" className="logo" />
          <h1 className="title">Maintenance Reporter</h1>
          <nav className="nav">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link">About</Link>
            {session && (
              <Link to="/profile" className="nav-link">Profile</Link>
            )}
          </nav>
        </div>
        
        <div className="auth-buttons">
          {session ? (
            <>
              <button className="profile-btn" onClick={handleProfileClick}>
                <span className="profile-icon">👤</span>
              </button>
              <button className="signout-btn-header" onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button className="signin-btn-header" onClick={() => navigate('/signin')}>
                Sign In
              </button>
              <button className="signup-btn-header" onClick={() => navigate('/signup')}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header