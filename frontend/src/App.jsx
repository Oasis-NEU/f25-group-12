import { useState } from 'react'
import './App.css'

function App() {
  // Sample data - replace with actual data later
  const [reports, setReports] = useState([
    { id: 1, property: 'Property X', user: 'User X', description: 'Description....................................................', dateTime: 'Date + Time X', status: 'resolved' },
    { id: 2, property: 'Property X', user: 'User X', description: 'Description....................................................', dateTime: 'Date + Time X', status: 'unresolved' },
    { id: 3, property: 'Property X', user: 'User X', description: 'Description....................................................', dateTime: 'Date + Time X', status: 'ongoing' },
    { id: 4, property: 'Property X', user: 'User X', description: 'Description....................................................', dateTime: 'Date + Time X', status: 'resolved' },
    { id: 5, property: 'Property X', user: 'User X', description: 'Description....................................................', dateTime: 'Date + Time X', status: 'unresolved' },
  ])

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-nav">
            <img src="/logo.png" alt="Logo" className="logo" />
            <h1 className="title">Maintenance Reporter</h1>
            <nav className="nav">
              <a href="#home" className="nav-link">Home</a>
              <a href="#about" className="nav-link">About</a>
            </nav>
          </div>
          <button className="profile-btn">
            <span className="profile-icon">👤</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Reports List */}
        <section className="reports-section">
          <div className="reports-grid">
            {/* Headers */}
            <div className="report-header">Property X</div>
            <div className="report-header">User X</div>
            <div className="report-header">Description</div>
            <div className="report-header">Date + Time X</div>

            {/* Report Rows */}
            {reports.map((report) => (
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
            ))}
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
              {/* Add your chart bars here */}
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
              <p>Unresolved Logs: <strong>[__]</strong></p>
            </div>
            <div className="stat-card">
              <p>Tenants With Outstanding Logs: <strong>[__]</strong></p>
            </div>
            <div className="stat-card">
              <p>Other Relevant Stats...</p>
            </div>
          </div>

          <div className="decorative-icons">
            <img src="/cone.png" alt="Cone" className="cone-icon" />
            <img src="/bucket.png" alt="Bucket" className="bucket-icon" />
          </div>
        </section>
      </main>
    </div>
  )
}

export default App