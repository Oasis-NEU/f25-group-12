import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'

function CreateIssue() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'OPEN',
    property_id: ''
  })
  const [properties, setProperties] = useState([])
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { session } = UserAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (session) {
      fetchUserData()
    }
  }, [session])

  const fetchUserData = async () => {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('Users')
        .select('user_id, role, full_name')
        .eq('auth_id', session.user.id)
        .single()

      if (profileError) throw profileError
      setUserProfile(profile)

      // Get user's properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('Properties')
        .select('property_id, name, address')
        .eq('user_id', profile.user_id)
        .order('name')

      if (propertiesError) throw propertiesError
      setProperties(propertiesData || [])
      
      // Auto-select first property if available
      if (propertiesData && propertiesData.length > 0) {
        setFormData(prev => ({ ...prev, property_id: propertiesData[0].property_id }))
      }
    } catch (err) {
      console.error('Error fetching user data:', err)
      setError('Failed to load user data')
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

      if (properties.length > 0 && !formData.property_id) {
        setError('Please select a property')
        setLoading(false)
        return
      }

      // Create the issue
      const { data, error: insertError } = await supabase
        .from('Issues')
        .insert([
          {
            title: formData.title.trim(),
            description: formData.description.trim(),
            priority: formData.priority,
            status: formData.status,
            property_id: formData.property_id || null,
            reported_by: userProfile.user_id,
            date_reported: new Date().toISOString(),
            date_resolved: null,
            assigned_to: formData.user_id
          }
        ])
        .select()

      if (insertError) throw insertError

      alert('Issue created successfully!')
      navigate('/')
    } catch (err) {
      console.error('Error creating issue:', err)
      setError(err.message || 'Failed to create issue')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/')
  }

  return (
    <main className="main-content">
      <div className="create-issue-container">
        <div className="create-issue-box">
          <h2 className="create-issue-title">Report New Issue</h2>
          
          {error && <div className="error-message">{error}</div>}

          {properties.length === 0 && (
            <div className="warning-message">
              <p>You don't have any properties yet. Create a property first or report without one.</p>
              <button 
                type="button"
                onClick={() => navigate('/create-property')}
                className="secondary-btn"
              >
                Create Property
              </button>
            </div>
          )}
          
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

            {properties.length > 0 && (
              <div className="form-group">
                <label htmlFor="property_id">Property:</label>
                <select
                  id="property_id"
                  name="property_id"
                  value={formData.property_id}
                  onChange={handleChange}
                >
                  <option value="">Select a property</option>
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

            <div className="form-buttons">
              <button 
                type="button" 
                onClick={handleCancel} 
                className="cancel-btn"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Issue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

export default CreateIssue