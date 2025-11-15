import * as db from '../services/database.js'

// Get all issues
export async function getAllIssues(req, res) {
  try {
    const issues = await db.getAllIssues()
    res.json(issues)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get issue by ID
export async function getIssueById(req, res) {
  try {
    const issue = await db.getIssueById(req.params.id)
    if (!issue) return res.status(404).json({ error: 'Issue not found' })
    res.json(issue)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Create new issue
export async function createIssue(req, res) {
  try {
    const newIssue = await db.createIssue(req.body)
    res.status(201).json(newIssue)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update issue
export async function updateIssue(req, res) {
  try {
    const updated = await db.updateIssue(req.params.id, req.body)
    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update issue status only
export async function updateIssueStatus(req, res) {
  try {
    const { status } = req.body
    const updated = await db.updateIssueStatus(req.params.id, status)
    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
