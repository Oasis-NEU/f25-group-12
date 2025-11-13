import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'

function Profile() {
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const { session, signOut } = UserAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session) return

      try {
        const { data, error } = await supabase
          .from('Users')
          .select('*, Industry(name)')
          .eq('auth_id', session.user.id)
          .single()

        if (error) throw error
        setUserProfile(data)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [session])

  const handleSignOut = async () => {
    await signOut()
    navigate('/signin')
  }

  if (loading) {
    return (
      <main className="main-content">
        <div className="profile-container">
          <p>Loading profile...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="main-content">
        <div className="profile-container">
          <div className="error-message">{error}</div>
        </div>
      </main>
    )
  }

  return (
    <main className="main-content">
      <div className="profile-container">
        <div className="profile-box">
          <h2 className="profile-title">User Profile</h2>
          
          <div className="profile-info">
            <div className="profile-field">
              <label>Full Name:</label>
              <p>{userProfile?.full_name || 'Not provided'}</p>
            </div>

            <div className="profile-field">
              <label>Email:</label>
              <p>{userProfile?.email}</p>
            </div>

            <div className="profile-field">
              <label>Role:</label>
              <p className="role-badge">{userProfile?.role}</p>
            </div>

            <div className="profile-field">
              <label>Phone:</label>
              <p>{userProfile?.phone || 'Not provided'}</p>
            </div>

            <div className="profile-field">
              <label>Industry:</label>
              <p>{userProfile?.Industry?.name || 'Not specified'}</p>
            </div>

            <div className="profile-field">
              <label>User ID:</label>
              <p>{userProfile?.user_id}</p>
            </div>
          </div>

          <div className="profile-buttons">
            <button 
              onClick={() => navigate('/')} 
              className="cancel-btn"
            >
              Back to Home
            </button>
            <button 
              onClick={handleSignOut} 
              className="signout-btn"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Profile