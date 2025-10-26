import express from 'express'
import * as db from '../services/database.js'

const router = express.Router()

// Get all properties
router.get('/', async (req, res) => {
  try {
    const properties = await db.getAllProperties()
    res.json(properties)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get property by ID
router.get('/:id', async (req, res) => {
  try {
    const property = await db.getPropertyById(req.params.id)
    res.json(property)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create property
router.post('/', async (req, res) => {
  try {
    const newProperty = await db.createProperty(req.body)
    res.status(201).json(newProperty)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router