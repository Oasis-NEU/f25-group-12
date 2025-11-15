import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'

function Home() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  
  const { session } = UserAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (session) {
      fetchReports()
    } else {
      setLoading(false)
    }
  }, [session])

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)

      // First, get the user's profile
      const { data: profile, error: profileError } = await supabase
        .from('Users')
        .select('user_id, role, full_name')
        .eq('auth_id', session.user.id)
        .single()

      if (profileError) throw profileError
      setUserProfile(profile)

      // Fetch issues based on user role
      let issuesQuery = supabase
        .from('Issues')
        .select('*')
        .order('date_reported', { ascending: false })

      // CLIENT users only see their own issues
      if (profile.role === 'CLIENT') {
        issuesQuery = issuesQuery.or(`reported_by.eq.${profile.user_id},assigned_to.eq.${profile.user_id}`)
      }
      // TECHNICIAN sees issues assigned to them
      else if (profile.role === 'TECHNICIAN') {
        issuesQuery = issuesQuery.eq('assigned_to', profile.user_id)
      }
      // ADMIN sees everything (no filter)
      
      const { data: issues, error: issuesError } = await issuesQuery

      if (issuesError) throw issuesError

      // Fetch all unique user IDs
      const userIds = new Set()
      issues?.forEach(issue => {
        if (issue.reported_by) userIds.add(issue.reported_by)
        if (issue.assigned_to) userIds.add(issue.assigned_to)
      })

      // Fetch user details
      const { data: users } = await supabase
        .from('Users')
        .select('user_id, full_name, email')
        .in('user_id', Array.from(userIds))

      const usersMap = {}
      users?.forEach(user => {
        usersMap[user.user_id] = user
      })

      // Fetch properties (if they exist)
      let propertiesMap = {}
      if (issues && issues.length > 0) {
        const propertyIds = issues
          .map(i => i.property_id)
          .filter(Boolean)
        
        if (propertyIds.length > 0) {
          const { data: properties } = await supabase
            .from('Properties')
            .select('property_id, name, address')
            .in('property_id', propertyIds)
          
          properties?.forEach(prop => {
            propertiesMap[prop.property_id] = prop
          })
        }
      }
      
      // Transform data
      const formattedReports = (issues || []).map(issue => ({
        id: issue.issue_id,
        property: propertiesMap[issue.property_id]?.name || issue.title || `Issue #${issue.issue_id}`,
        user: usersMap[issue.reported_by]?.full_name || `User ${issue.reported_by}`,
        description: issue.description || 'No description',
        dateTime: new Date(issue.date_reported).toLocaleString(),
        status: issue.status?.toLowerCase() || 'unresolved'
      }))
      
      setReports(formattedReports)
    } catch (err) {
      console.error('Error fetching reports:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // If not logged in, show a message
  if (!session && !loading) {
    return (
      <main className="main-content">
        <div className="welcome-message">
          <h2>Welcome to Maintenance Reporter</h2>
          <p>Please sign in to view your maintenance reports.</p>
          <button 
            className="signin-btn"
            onClick={() => navigate('/signin')}
          >
            Sign In
          </button>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="main-content">
        <div className="loading">Loading reports...</div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="main-content">
        <div className="error">Error loading reports: {error}</div>
      </main>
    )
  }

  // Calculate stats
  const unresolvedCount = reports.filter(r => r.status === 'unresolved' || r.status === 'open').length
  const ongoingCount = reports.filter(r => r.status === 'ongoing' || r.status === 'in_progress').length

  return (
    <main className="main-content">
      {/* Sidebar + user header */}
      <div className="top-section">
        <aside className="sidenav">
          <div className="sidenav-title">Properties</div>

          <ul className="property-list">
            {Array.from(new Set(reports.map(r => r.property))).map(prop => (
              <li key={prop} className="property-list-item">{prop}</li>
            ))}
          </ul>
        </aside>

        {userProfile && (
          <div className="user-info-header">
            <h2>My Maintenance Reports</h2>
            <span className="role-badge">{userProfile.role}</span>
          </div>
        )}
      </div>
      {/* Reports List */}
      <section className="reports-section">
        <div className="reports-grid">
          {/* Headers */}
          <div className="report-header">User</div>
          <div className="report-header">Description</div>
          <div className="report-header">Date + Time</div>

          {/* Report Rows */}
          {reports.length === 0 ? (
          <div className="no-reports" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
            <p>No reports found.</p>
            <button 
              onClick={() => navigate('/create-issue')}
              className="add-btn"
            >
              + Create Your First Issue
            </button>
          </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="report-row">
                <div className={`report-cell property-cell ${report.status}`}>
                  {report.property}
                </div>
                <div className="report-cell">
                  {report.user}
                </div>
                <div className="report-cell description">
                  {report.description}
                </div>
                <div className="report-cell">
                  {report.dateTime}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Legend */}
        <div className="legend">
          <span className="legend-item">
            <span className="legend-color resolved"></span>
            Resolved
          </span>
          <span className="legend-item">
            <span className="legend-color unresolved"></span>
            Unresolved
          </span>
          <span className="legend-item">
            <span className="legend-color ongoing"></span>
            Ongoing
          </span>
        </div>
      </section>

      {/* Dashboard */}
      <section className="dashboard">
        <div className="chart">
          <div className="chart-bars">
            <div className="bar" style={{ height: '40%', backgroundColor: '#D3D3D3' }}></div>
            <div className="bar" style={{ height: '60%', backgroundColor: '#D3D3D3' }}></div>
            <div className="bar" style={{ height: '80%', backgroundColor: '#FF6B47' }}></div>
            <div className="bar" style={{ height: '90%', backgroundColor: '#FF6B47' }}></div>
            <div className="bar" style={{ height: '100%', backgroundColor: '#FF6B47' }}></div>
            <div className="bar" style={{ height: '70%', backgroundColor: '#FF6B47' }}></div>
          </div>
        </div>
        
        <div className="stats">
          <div className="stat-card">
            <p>Unresolved Logs: <strong>{unresolvedCount}</strong></p>
          </div>
          <div className="stat-card">
            <p>Ongoing Issues: <strong>{ongoingCount}</strong></p>
          </div>
          <div className="stat-card">
            <p>Total Reports: <strong>{reports.length}</strong></p>
          </div>
        </div>

        <div className="decorative-icons">
          <img src="/cone.png" alt="Cone" className="cone-icon" />
          <img src="/bucket.png" alt="Bucket" className="bucket-icon" />
        </div>
      </section>
    </main>
  )
}

export default Home