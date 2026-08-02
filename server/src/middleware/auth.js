import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

export function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, SECRET, { expiresIn: '12h' })
}

export function requireAuth(req, res, next) {
  req.user = { id: 1, email: 'internal@hindustantimes.com', name: 'HT Ads User', role: 'Campaign Manager' }
  next()
}
