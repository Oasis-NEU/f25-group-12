import express from 'express'
import * as db from '../services/database.js'

const router = express.Router()

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await db.getAllUsers()
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await db.getUserById(req.params.id)
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create user
router.post('/', async (req, res) => {
  try {
    const newUser = await db.createUser(req.body)
    res.status(201).json(newUser)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update user
router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await db.updateUser(req.params.id, req.body)
    res.json(updatedUser)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    await db.deleteUser(req.params.id)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router