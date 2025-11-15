import { useState, useEffect } from 'react'
import { getIssues } from '../api/api'

function Home() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getIssues()
      
      // Transform data to match your component structure
      const formattedReports = data.map(issue => ({
        id: issue.issues_id,
        property: issue.title || `Issue #${issue.issues_id}`,
        user: `User ${issue.user_id || 'Unknown'}`,
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
  const unresolvedCount = reports.filter(r => r.status === 'unresolved').length
  const ongoingCount = reports.filter(r => r.status === 'ongoing').length

  return (
    <main className="main-content">
      {/* side nav */}
      <div className="sidenav">
        <div className="sidenav-title">Properties</div>

        <ul className="property-list">
          {Array.from(new Set(reports.map(r => r.property))).map(prop => (
            <li
              key={prop}
              className="property-list-item"
            >
              {prop}
            </li>
          ))}
        </ul>
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
              No reports found
            </div>
          ) : (
            reports.map((report) => (
              <>
                <div key={`${report.id}-property`} className={`report-cell property-cell ${report.status}`}>
                  {report.property}
                </div>
                <div key={`${report.id}-user`} className="report-cell">
                  {report.user}
                </div>
                <div key={`${report.id}-description`} className="report-cell description">
                  {report.description}
                </div>
                <div key={`${report.id}-datetime`} className="report-cell">
                  {report.dateTime}
                </div>
              </>
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