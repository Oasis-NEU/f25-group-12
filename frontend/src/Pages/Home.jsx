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

  // Calculate priority counts for bar chart
  const priorityCounts = {
    URGENT: reports.filter(r => r.priority === 'URGENT').length,
    HIGH: reports.filter(r => r.priority === 'HIGH').length,
    MEDIUM: reports.filter(r => r.priority === 'MEDIUM').length,
    MINOR: reports.filter(r => r.priority === 'MINOR').length
  }

  // Find max for scaling
  const maxCount = Math.max(...Object.values(priorityCounts), 1)

  // Generate bar data
  const barData = [
    { label: 'Urgent', count: priorityCounts.URGENT, color: '#521000' },
    { label: 'High', count: priorityCounts.HIGH, color: '#ff4242' },
    { label: 'Medium', count: priorityCounts.MEDIUM, color: '#FFA500' },
    { label: 'Minor', count: priorityCounts.MINOR, color: '#D3D3D3' }
  ]

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
        <h3 className="dashboard-title">Dashboard Overview</h3>
        
        {/* Status Cards */}
        <div className="status-cards">
          <div className="status-card status-open">
            <div className="status-icon">🔴</div>
            <div className="status-info">
              <div className="status-number">{unresolvedCount}</div>
              <div className="status-label">Open Issues</div>
            </div>
          </div>
          
          <div className="status-card status-progress">
            <div className="status-icon">🟠</div>
            <div className="status-info">
              <div className="status-number">{ongoingCount}</div>
              <div className="status-label">In Progress</div>
            </div>
          </div>
          
          <div className="status-card status-resolved">
            <div className="status-icon">🟢</div>
            <div className="status-info">
              <div className="status-number">{resolvedCount}</div>
              <div className="status-label">Resolved</div>
            </div>
          </div>
          
          <div className="status-card status-total">
            <div className="status-icon">📊</div>
            <div className="status-info">
              <div className="status-number">{reports.length}</div>
              <div className="status-label">Total Issues</div>
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="priority-section">
          <h4>Priority Breakdown</h4>
          <div className="priority-bars">
            {priorityCounts.URGENT > 0 && (
              <div className="priority-row">
                <span className="priority-row-label">Urgent</span>
                <div className="priority-bar-container">
                  <div 
                    className="priority-bar urgent-bar" 
                    style={{ width: `${(priorityCounts.URGENT / reports.length) * 100}%` }}
                  >
                    <span className="priority-bar-count">{priorityCounts.URGENT}</span>
                  </div>
                </div>
              </div>
            )}
            {priorityCounts.HIGH > 0 && (
              <div className="priority-row">
                <span className="priority-row-label">High</span>
                <div className="priority-bar-container">
                  <div 
                    className="priority-bar high-bar" 
                    style={{ width: `${(priorityCounts.HIGH / reports.length) * 100}%` }}
                  >
                    <span className="priority-bar-count">{priorityCounts.HIGH}</span>
                  </div>
                </div>
              </div>
            )}
            {priorityCounts.MEDIUM > 0 && (
              <div className="priority-row">
                <span className="priority-row-label">Medium</span>
                <div className="priority-bar-container">
                  <div 
                    className="priority-bar medium-bar" 
                    style={{ width: `${(priorityCounts.MEDIUM / reports.length) * 100}%` }}
                  >
                    <span className="priority-bar-count">{priorityCounts.MEDIUM}</span>
                  </div>
                </div>
              </div>
            )}
            {priorityCounts.MINOR > 0 && (
              <div className="priority-row">
                <span className="priority-row-label">Minor</span>
                <div className="priority-bar-container">
                  <div 
                    className="priority-bar minor-bar" 
                    style={{ width: `${(priorityCounts.MINOR / reports.length) * 100}%` }}
                  >
                    <span className="priority-bar-count">{priorityCounts.MINOR}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="decorative-icons">
          <img src="/public/Maintenance Reporter Thick Variant.png" alt="Cone" className="cone-icon" />
        </div>
      </section>
    </main>
  )
}

export default Home