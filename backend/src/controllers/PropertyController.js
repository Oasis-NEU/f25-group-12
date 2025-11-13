import * as db from '../services/database.js'

export async function getAllProperties(req, res) {
  try {
    const properties = await db.getAllProperties()
    res.json(properties)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export async function getPropertyById(req, res) {
  try {
    const property = await db.getPropertyById(req.params.id)
    if (!property) return res.status(404).json({ error: 'Property not found' })
    res.json(property)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export async function createProperty(req, res) {
  try {
    const newProperty = await db.createProperty(req.body)
    res.status(201).json(newProperty)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
