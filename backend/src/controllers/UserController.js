import * as db from '../services/database.js'

export async function getAllUsers(req, res) {
  try {
    const users = await db.getAllUsers()
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export async function getUserById(req, res) {
  try {
    const user = await db.getUserById(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export async function createUser(req, res) {
  try {
    const newUser = await db.createUser(req.body)
    res.status(201).json(newUser)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export async function updateUser(req, res) {
  try {
    const updated = await db.updateUser(req.params.id, req.body)
    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export async function deleteUser(req, res) {
  try {
    await db.deleteUser(req.params.id)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
