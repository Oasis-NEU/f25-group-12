import { supabase } from './supabase.js'

// ===== USERS =====
export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('Users')
    .select('*')
  
  if (error) throw error
  return data
}

export const getUserById = async (userId) => {
  const { data, error } = await supabase
    .from('Users')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) throw error
  return data
}

export const createUser = async (userData) => {
  const { data, error } = await supabase
    .from('Users')
    .insert([userData])
    .select()
  
  if (error) throw error
  return data
}

export const updateUser = async (userId, userData) => {
  const { data, error } = await supabase
    .from('Users')
    .update(userData)
    .eq('user_id', userId)
    .select()
  
  if (error) throw error
  return data
}

export const deleteUser = async (userId) => {
  const { data, error } = await supabase
    .from('Users')
    .delete()
    .eq('user_id', userId)
  
  if (error) throw error
  return data
}

// ===== PROPERTIES =====
export const getAllProperties = async () => {
  const { data, error } = await supabase
    .from('Properties')
    .select('*')
  
  if (error) throw error
  return data
}

export const getPropertyById = async (propertyId) => {
  const { data, error } = await supabase
    .from('Properties')
    .select('*')
    .eq('property_id', propertyId)
    .single()
  
  if (error) throw error
  return data
}

export const createProperty = async (propertyData) => {
  const { data, error } = await supabase
    .from('Properties')
    .insert([propertyData])
    .select()
  
  if (error) throw error
  return data
}

// ===== ISSUES =====
export const getAllIssues = async () => {
  const { data, error } = await supabase
    .from('Issues')
    .select(`
      *,
      IssuePhotos (*)
    `)
    .order('date_reported', { ascending: false })
  
  if (error) throw error
  return data
}

export const getIssueById = async (issueId) => {
  const { data, error } = await supabase
    .from('Issues')
    .select(`
      *,
      IssuePhotos (*)
    `)
    .eq('issues_id', issueId)
    .single()
  
  if (error) throw error
  return data
}

export const createIssue = async (issueData) => {
  const { data, error } = await supabase
    .from('Issues')
    .insert([issueData])
    .select()
  
  if (error) throw error
  return data
}

export const updateIssue = async (issueId, issueData) => {
  const { data, error } = await supabase
    .from('Issues')
    .update(issueData)
    .eq('issues_id', issueId)
    .select()
  
  if (error) throw error
  return data
}

export const updateIssueStatus = async (issueId, status) => {
  const { data, error } = await supabase
    .from('Issues')
    .update({ status })
    .eq('issues_id', issueId)
    .select()
  
  if (error) throw error
  return data
}

// ===== MAINTENANCE LOGS =====
export const getAllMaintenanceLogs = async () => {
  const { data, error } = await supabase
    .from('MaintenanceLogs')
    .select('*')
    .order('created_in', { ascending: false })
  
  if (error) throw error
  return data
}

export const createMaintenanceLog = async (logData) => {
  const { data, error } = await supabase
    .from('MaintenanceLogs')
    .insert([logData])
    .select()
  
  if (error) throw error
  return data
}

// ===== INDUSTRY =====
export const getAllIndustries = async () => {
  const { data, error } = await supabase
    .from('Industry')
    .select('*')
  
  if (error) throw error
  return data
}

// ===== INDUSTRY SERVICES =====
export const getAllIndustryServices = async () => {
  const { data, error } = await supabase
    .from('IndustryServices')
    .select('*')
  
  if (error) throw error
  return data
}