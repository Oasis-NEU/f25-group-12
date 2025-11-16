import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import React from 'react'

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

  // Helper function to format date from database (date only, no time)
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    
    const date = new Date(dateString)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    })
  }

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
        title: issue.title || `Issue #${issue.issue_id}`,
        property: issue.property_id 
          ? (propertiesMap[issue.property_id]?.name || 'Unknown Property')
          : 'No Property',
        propertyAddress: issue.property_id 
          ? propertiesMap[issue.property_id]?.address 
          : null,
        user: usersMap[issue.reported_by]?.full_name || `User ${issue.reported_by}`,
        assignedTo: issue.assigned_to 
          ? (usersMap[issue.assigned_to]?.full_name || `User ${issue.assigned_to}`)
          : 'Unassigned',
        description: issue.description || 'No description',
        dateTime: formatDateTime(issue.date_reported),
        status: issue.status?.toLowerCase() || 'open',
        priority: issue.priority || 'MEDIUM'
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
  const unresolvedCount = reports.filter(r => 
    r.status === 'open' || r.status === 'unresolved'
  ).length
  const ongoingCount = reports.filter(r => 
    r.status === 'in_progress' || r.status === 'ongoing' || r.status === 'inprogress'
  ).length
  const resolvedCount = reports.filter(r => 
    r.status === 'resolved' || r.status === 'closed'
  ).length

  return (
    <main className="main-content">
      {/* User Info Header */}
      {userProfile && (
        <div className="user-info-header">
          <h2>My Maintenance Reports</h2>
          <span className="role-badge">{userProfile.role}</span>
        </div>
      )}

      {/* Reports List */}
      <section className="reports-section">
        <div className="reports-grid">
          {/* Headers */}
          <div className="report-header">Property</div>
          <div className="report-header">Issue</div>
          <div className="report-header">Priority</div>
          <div className="report-header">Reported By</div>
          <div className="report-header">Assigned To</div>
          <div className="report-header">Description</div>
          <div className="report-header">Date Reported</div>
          <div className="report-header">Actions</div>

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
              <React.Fragment key={report.id}>
                <div className={`report-cell property-cell ${report.status}`} title={report.propertyAddress || report.property}>
                  {report.property}
                </div>
                <div className="report-cell">
                  {report.title}
                </div>
                <div className="report-cell">
                  <span className={`priority-badge priority-${report.priority.toLowerCase()}`}>
                    {report.priority}
                  </span>
                </div>
                <div className="report-cell">
                  {report.user}
                </div>
                <div className={`report-cell ${report.assignedTo === 'Unassigned' ? 'unassigned' : ''}`}>
                  {report.assignedTo}
                </div>
                <div className="report-cell description">
                  {report.description}
                </div>
                <div className="report-cell">
                  {report.dateTime}
                </div>
                <div className="report-cell actions-cell">
                  <button 
                    className="edit-btn-small"
                    onClick={() => navigate(`/edit-issue/${report.id}`)}
                  >
                    Edit
                  </button>
                </div>
              </React.Fragment>
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
            Ongoing
          </span>
          <span className="legend-item">
            <span className="legend-color ongoing"></span>
            Open
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