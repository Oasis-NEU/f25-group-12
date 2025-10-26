const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Helper function for making requests
async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Something went wrong')
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null
  }

  return response.json()
}

// ===== USERS =====
export const getUsers = () => fetchAPI('/users')

export const getUserById = (id) => fetchAPI(`/users/${id}`)

export const createUser = (userData) => 
  fetchAPI('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  })

export const updateUser = (id, userData) => 
  fetchAPI(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  })

export const deleteUser = (id) => 
  fetchAPI(`/users/${id}`, {
    method: 'DELETE',
  })

// ===== ISSUES =====
export const getIssues = () => fetchAPI('/issues')

export const getIssueById = (id) => fetchAPI(`/issues/${id}`)

export const createIssue = (issueData) => 
  fetchAPI('/issues', {
    method: 'POST',
    body: JSON.stringify(issueData),
  })

export const updateIssue = (id, issueData) => 
  fetchAPI(`/issues/${id}`, {
    method: 'PUT',
    body: JSON.stringify(issueData),
  })

export const updateIssueStatus = (id, status) => 
  fetchAPI(`/issues/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

export const deleteIssue = (id) => 
  fetchAPI(`/issues/${id}`, {
    method: 'DELETE',
  })

// ===== PROPERTIES =====
export const getProperties = () => fetchAPI('/properties')

export const getPropertyById = (id) => fetchAPI(`/properties/${id}`)

export const createProperty = (propertyData) => 
  fetchAPI('/properties', {
    method: 'POST',
    body: JSON.stringify(propertyData),
  })

export const updateProperty = (id, propertyData) => 
  fetchAPI(`/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(propertyData),
  })

export const deleteProperty = (id) => 
  fetchAPI(`/properties/${id}`, {
    method: 'DELETE',
  })