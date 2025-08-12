import { Router } from 'express'
import { Pool } from 'mysql2/promise'

function parseImages(input: any): any {
  if (!input) return []
  if (Array.isArray(input)) return input
  if (typeof input === 'string') {
    try { return JSON.parse(input) } catch { return [] }
  }
  return []
}

export function buildAdminRouter(pool: Pool) {
  const router = Router()

  // Overview counts
  router.get('/overview', async (_req, res) => {
    try {
      const [[p]]: any = await pool.query('SELECT COUNT(*) as count FROM products')
      const [[u]]: any = await pool.query('SELECT COUNT(*) as count FROM users')
      const [[o]]: any = await pool.query('SELECT COUNT(*) as count FROM orders')
      res.json({ products: p.count, users: u.count, orders: o.count })
    } catch (e) {
      res.status(500).json({ error: (e as Error).message })
    }
  })

  // Products
  router.get('/products', async (_req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, c.name as category_name, b.name as brand_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        ORDER BY p.created_at DESC
        LIMIT 500
      `)
      const normalized = (rows as any[]).map(p => ({ ...p, images: typeof p.images === 'string' ? (() => { try { return JSON.parse(p.images) } catch { return [] } })() : (p.images || []) }))
      res.json(normalized)
    } catch (e) { res.status(500).json({ error: (e as Error).message }) }
  })

  router.post('/products', async (req, res) => {
    const { name, slug, description, price, inventory, category_id, brand_id, age_min, age_max, images, is_featured } = req.body
    if (!name || !slug || price == null) return res.status(400).json({ error: 'Missing fields' })
    try {
      const [result] = await pool.query(
        `INSERT INTO products (name, slug, description, price, inventory, category_id, brand_id, age_min, age_max, images, is_featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, slug, description || '', Number(price), Number(inventory || 0), category_id || null, brand_id || null, age_min || 0, age_max || 120, JSON.stringify(parseImages(images)), !!is_featured]
      )
      res.json({ ok: true, id: (result as any).insertId })
    } catch (e) { res.status(400).json({ error: (e as Error).message }) }
  })

  router.put('/products/:id', async (req, res) => {
    const id = Number(req.params.id)
    const fields = ['name','slug','description','price','inventory','category_id','brand_id','age_min','age_max','images','is_featured'] as const
    const sets: string[] = []
    const params: any[] = []
    for (const f of fields) {
      if (f in req.body) {
        sets.push(`${f} = ?`)
        if (f === 'images') params.push(JSON.stringify(parseImages(req.body[f])))
        else if (f === 'is_featured') params.push(!!req.body[f])
        else params.push(req.body[f])
      }
    }
    if (!sets.length) return res.json({ ok: true })
    try {
      await pool.query(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`, [...params, id])
      res.json({ ok: true })
    } catch (e) { res.status(400).json({ error: (e as Error).message }) }
  })

  router.delete('/products/:id', async (req, res) => {
    const id = Number(req.params.id)
    try { await pool.query('DELETE FROM products WHERE id = ?', [id]); res.json({ ok: true }) }
    catch (e) { res.status(400).json({ error: (e as Error).message }) }
  })

  router.put('/products/:id/inventory', async (req, res) => {
    const id = Number(req.params.id)
    const { inventory } = req.body
    try { await pool.query('UPDATE products SET inventory = ? WHERE id = ?', [Number(inventory), id]); res.json({ ok: true }) }
    catch (e) { res.status(400).json({ error: (e as Error).message }) }
  })

  // Orders
  router.get('/orders', async (_req, res) => {
    try {
      const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 500')
      res.json(orders)
    } catch (e) { res.status(500).json({ error: (e as Error).message }) }
  })

  router.put('/orders/:id/status', async (req, res) => {
    const id = Number(req.params.id)
    const { status } = req.body
    const allowed = ['pending','paid','shipped','delivered','cancelled']
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' })
    try { await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]); res.json({ ok: true }) }
    catch (e) { res.status(400).json({ error: (e as Error).message }) }
  })

  // Users
  router.get('/users', async (_req, res) => {
    try {
      const [rows] = await pool.query('SELECT id, email, phone, full_name, role, created_at FROM users ORDER BY created_at DESC LIMIT 500')
      res.json(rows)
    } catch (e) { res.status(500).json({ error: (e as Error).message }) }
  })

  // Promotions
  router.get('/promotions', async (_req, res) => {
    try { const [rows] = await pool.query('SELECT * FROM promotions ORDER BY id DESC LIMIT 200'); res.json(rows) }
    catch (e) { res.status(500).json({ error: (e as Error).message }) }
  })

  router.post('/promotions', async (req, res) => {
    const { title, description, discount_percent, start_date, end_date, active } = req.body
    if (!title) return res.status(400).json({ error: 'Missing title' })
    try {
      const [result] = await pool.query(
        'INSERT INTO promotions (title, description, discount_percent, start_date, end_date, active) VALUES (?, ?, ?, ?, ?, ?)',
        [title, description || '', Number(discount_percent || 0), start_date || null, end_date || null, active != null ? !!active : true]
      )
      res.json({ ok: true, id: (result as any).insertId })
    } catch (e) { res.status(400).json({ error: (e as Error).message }) }
  })

  router.put('/promotions/:id', async (req, res) => {
    const id = Number(req.params.id)
    const fields = ['title','description','discount_percent','start_date','end_date','active'] as const
    const sets: string[] = []
    const params: any[] = []
    for (const f of fields) {
      if (f in req.body) { sets.push(`${f} = ?`); params.push(req.body[f]) }
    }
    if (!sets.length) return res.json({ ok: true })
    try { await pool.query(`UPDATE promotions SET ${sets.join(', ')} WHERE id = ?`, [...params, id]); res.json({ ok: true }) }
    catch (e) { res.status(400).json({ error: (e as Error).message }) }
  })

  router.delete('/promotions/:id', async (req, res) => {
    const id = Number(req.params.id)
    try { await pool.query('DELETE FROM promotions WHERE id = ?', [id]); res.json({ ok: true }) }
    catch (e) { res.status(400).json({ error: (e as Error).message }) }
  })

  return router
}