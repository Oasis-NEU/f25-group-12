import { Link, useNavigate } from 'react-router-dom'

function Header() {
  const navigate = useNavigate()

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-nav">
          <img src="/logo.png" alt="Logo" className="logo" />
          <h1 className="title">Maintenance Reporter</h1>
          <nav className="nav">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link">About</Link>
          </nav>
        </div>
        <button className="profile-btn" onClick={() => navigate('/signin')}>
          <span className="profile-icon">👤</span>
        </button>
      </div>
    </header>
  )
}

export default Header