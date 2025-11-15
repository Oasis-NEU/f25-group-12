import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'

function CreateProperty() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    industry_id: ''
  })
  const [industries, setIndustries] = useState([])
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { session } = UserAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (session) {
      fetchUserData()
      fetchIndustries()
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
    } catch (err) {
      console.error('Error fetching user data:', err)
      setError('Failed to load user data')
    }
  }

  const fetchIndustries = async () => {
    try {
      const { data, error } = await supabase
        .from('Industry')
        .select('industry_id, name')
        .order('name')

      if (error) throw error
      setIndustries(data || [])
      
      if (data && data.length > 0) {
        setFormData(prev => ({ ...prev, industry_id: data[0].industry_id }))
      }
    } catch (err) {
      console.error('Error fetching industries:', err)
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
      if (!formData.name.trim()) {
        setError('Property name is required')
        setLoading(false)
        return
      }

      if (!formData.address.trim()) {
        setError('Property address is required')
        setLoading(false)
        return
      }

      // Create the property
      const { data, error: insertError } = await supabase
        .from('Properties')
        .insert([
          {
            name: formData.name.trim(),
            address: formData.address.trim(),
            description: formData.description.trim() || null,
            user_id: userProfile.user_id,
            industry_id: formData.industry_id || null
          }
        ])
        .select()

      if (insertError) throw insertError

      alert('Property created successfully!')
      navigate('/')
    } catch (err) {
      console.error('Error creating property:', err)
      setError(err.message || 'Failed to create property')
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
          <h2 className="create-issue-title">Create New Property</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Property Name: *</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="e.g., Sunset Apartments"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Property Address: *</label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="e.g., 123 Main Street, Boston, MA"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                placeholder="Provide additional details about the property..."
                value={formData.description}
                onChange={handleChange}
                rows="4"
              />
            </div>

            {industries.length > 0 && (
              <div className="form-group">
                <label htmlFor="industry_id">Industry:</label>
                <select
                  id="industry_id"
                  name="industry_id"
                  value={formData.industry_id}
                  onChange={handleChange}
                >
                  <option value="">Select an industry (optional)</option>
                  {industries.map(industry => (
                    <option key={industry.industry_id} value={industry.industry_id}>
                      {industry.name}
                    </option>
                  ))}
                </select>
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
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Property'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

export default CreateProperty