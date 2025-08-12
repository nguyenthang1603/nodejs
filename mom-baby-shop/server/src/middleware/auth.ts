import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export function authenticateRequest(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret') as any
    ;(req as any).user = payload
    next()
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
  next()
}