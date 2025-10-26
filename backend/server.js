import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import userRoutes from './src/routes/user_routes.js'
import issueRoutes from './src/routes/issue_routes.js'
import propertyRoutes from './src/routes/property_routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware - CORS must be before routes
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // frontend urls IMPORTANT: Change these when we deploy the app
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/users', userRoutes)
app.use('/api/issues', issueRoutes)
app.use('/api/properties', propertyRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})