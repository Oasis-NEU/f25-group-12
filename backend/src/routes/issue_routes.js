import express from 'express'
import * as db from '../services/database.js'

const router = express.Router()

// Get all issues
router.get('/', async (req, res) => {
  try {
    const issues = await db.getAllIssues()
    res.json(issues)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get issue by ID
router.get('/:id', async (req, res) => {
  try {
    const issue = await db.getIssueById(req.params.id)
    res.json(issue)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create issue
router.post('/', async (req, res) => {
  try {
    const newIssue = await db.createIssue(req.body)
    res.status(201).json(newIssue)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update issue
router.put('/:id', async (req, res) => {
  try {
    const updatedIssue = await db.updateIssue(req.params.id, req.body)
    res.json(updatedIssue)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update issue status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    const updatedIssue = await db.updateIssueStatus(req.params.id, status)
    res.json(updatedIssue)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router