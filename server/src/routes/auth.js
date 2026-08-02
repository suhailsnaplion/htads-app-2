import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { pool } from '../db/index.js'
import { signToken, requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()])
  const user = result.rows[0]
  if (!user) return res.status(401).json({ error: 'Invalid email or password' })

  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' })

  const token = signToken(user)
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

export default router
