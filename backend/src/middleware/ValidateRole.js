// middleware/validateRole.js
export function validateRole(req, res, next) {
  const validRoles = ['client', 'technician', 'admin']
  const { role } = req.body

  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({
      error: "Invalid role."
    })
  }

  // Only allow admins to create admins
  if (role === 'admin' && req.user?.role !== 'admin') {
    return res.status(403).json({
      error: "Only admins can create another admin."
    })
  }

  next()
}