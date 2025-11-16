import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'

function EditIssue() {
  const { issueId } = useParams()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'OPEN',
    property_id: '',
    assigned_to: ''
  })
  const [properties, setProperties] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [userProfile, setUserProfile] = useState(null)
  const [originalIssue, setOriginalIssue] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { session } = UserAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (session) {
      fetchData()
    }
  }, [session, issueId])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('Users')
        .select('user_id, role, full_name')
        .eq('auth_id', session.user.id)
        .single()

      if (profileError) throw profileError
      setUserProfile(profile)

      // Get the issue
      const { data: issue, error: issueError } = await supabase
        .from('Issues')
        .select('*')
        .eq('issue_id', issueId)
        .single()

      if (issueError) throw issueError
      setOriginalIssue(issue)

      // Populate form with existing data
      setFormData({
        title: issue.title || '',
        description: issue.description || '',
        priority: issue.priority || 'MEDIUM',
        status: issue.status || 'OPEN',
        property_id: issue.property_id || '',
        assigned_to: issue.assigned_to || ''
      })

      // Get user's properties (for clients)
      if (profile.role === 'CLIENT') {
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('Properties')
          .select('property_id, name, address')
          .eq('user_id', profile.user_id)
          .order('name')

        if (propertiesError) throw propertiesError
        setProperties(propertiesData || [])
      }

      // Get technicians
      const { data: technicianData, error: technicianError } = await supabase
        .from('Users')
        .select('user_id, full_name, email, role')
        .eq('role', 'TECHNICIAN')
        .order('full_name')

      if (technicianError) throw technicianError
      setTechnicians(technicianData || [])
      
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load issue data')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate
      if (!formData.title.trim()) {
        setError('Title is required')
        setLoading(false)
        return
      }

      if (!formData.description.trim()) {
        setError('Description is required')
        setLoading(false)
        return
      }

      // Update the issue
      const { error: updateError } = await supabase
        .from('Issues')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          status: formData.status,
          property_id: formData.property_id || null,
          assigned_to: formData.assigned_to || null,
          date_resolved: formData.status === 'RESOLVED' || formData.status === 'CLOSED' 
            ? new Date().toISOString() 
            : null
        })
        .eq('issue_id', issueId)

      if (updateError) throw updateError

      alert('Issue updated successfully!')
      navigate('/')
    } catch (err) {
      console.error('Error updating issue:', err)
      setError(err.message || 'Failed to update issue')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    // Only allow deletion if status is RESOLVED or CLOSED
    if (originalIssue.status !== 'RESOLVED' && originalIssue.status !== 'CLOSED') {
      alert('Only resolved or closed issues can be deleted')
      return
    }

    if (!window.confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
      return
    }

    try {
      setLoading(true)
      
      const { error: deleteError } = await supabase
        .from('Issues')
        .delete()
        .eq('issue_id', issueId)

      if (deleteError) throw deleteError

      alert('Issue deleted successfully!')
      navigate('/')
    } catch (err) {
      console.error('Error deleting issue:', err)
      setError(err.message || 'Failed to delete issue')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/')
  }

  if (loading && !originalIssue) {
    return (
      <main className="main-content">
        <div className="loading">Loading issue...</div>
      </main>
    )
  }

  return (
    <main className="main-content">
      <div className="create-issue-container">
        <div className="create-issue-box">
          <h2 className="create-issue-title">Edit Issue #{issueId}</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Issue Title: *</label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="e.g., Leaking pipe in bathroom"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description: *</label>
              <textarea
                id="description"
                name="description"
                placeholder="Provide detailed description of the issue..."
                value={formData.description}
                onChange={handleChange}
                rows="5"
                required
              />
            </div>

            {userProfile?.role === 'CLIENT' && properties.length > 0 && (
              <div className="form-group">
                <label htmlFor="property_id">Property:</label>
                <select
                  id="property_id"
                  name="property_id"
                  value={formData.property_id}
                  onChange={handleChange}
                >
                  <option value="">No Property</option>
                  {properties.map(property => (
                    <option key={property.property_id} value={property.property_id}>
                      {property.name} - {property.address}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="priority">Priority: *</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
              >
                <option value="MINOR">Minor</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status: *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="OPEN">Open</option>
                <option value="INPROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {userProfile?.role === 'CLIENT' && (
              <div className="form-group">
                <label htmlFor="assigned_to">Assign Technician:</label>
                <select
                  id="assigned_to"
                  name="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleChange}
                >
                  <option value="">Unassigned</option>
                  {technicians.map(tech => (
                    <option key={tech.user_id} value={tech.user_id}>
                      {tech.full_name} {tech.email ? `(${tech.email})` : ''}
                    </option>
                  ))}
                </select>
                {technicians.length === 0 && (
                  <small className="form-hint">No technicians available</small>
                )}
              </div>
            )}

            <div className="form-buttons">
              <button 
                type="button" 
                onClick={handleCancel} 
                className="cancel-btn"
                disabled={loading}
              >
                Cancel
              </button>
              {(originalIssue?.status === 'RESOLVED' || originalIssue?.status === 'CLOSED') && (
                <button 
                  type="button" 
                  onClick={handleDelete} 
                  className="delete-btn"
                  disabled={loading}
                >
                  Delete Issue
                </button>
              )}
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Issue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

export default EditIssue