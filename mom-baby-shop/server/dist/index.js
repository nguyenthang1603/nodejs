import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createPool } from 'mysql2/promise';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const pool = createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'appuser',
    password: process.env.DB_PASSWORD || 'apppassword',
    database: process.env.DB_NAME || 'mom_baby_shop',
    port: Number(process.env.DB_PORT || 3306),
    connectionLimit: 10,
    timezone: 'Z'
});
app.get('/api/health', async (_req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1+1 as result');
        res.json({ ok: true, db: rows[0].result });
    }
    catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});
// Products - basic list, search & filter
app.get('/api/products', async (req, res) => {
    const { q, category, brand, ageMin, ageMax, minPrice, maxPrice, featured, ids } = req.query;
    // normalize images field into arrays
    function normalizeProducts(rows) {
        return rows.map(p => ({
            ...p,
            images: typeof p.images === 'string' ? (() => { try {
                return JSON.parse(p.images);
            }
            catch {
                return [];
            } })() : (p.images || [])
        }));
    }
    // fetch by ids
    if (ids) {
        const idList = ids.split(',').map(id => Number(id)).filter(Boolean);
        if (!idList.length)
            return res.json([]);
        const placeholders = idList.map(() => '?').join(',');
        const sqlByIds = `
      SELECT p.*, c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.id IN (${placeholders})
    `;
        try {
            const [rows] = await pool.query(sqlByIds, idList);
            return res.json(normalizeProducts(rows));
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }
    const conditions = [];
    const params = [];
    if (q) {
        conditions.push('p.name LIKE ?');
        params.push(`%${q}%`);
    }
    if (category) {
        conditions.push('c.slug = ?');
        params.push(category);
    }
    if (brand) {
        conditions.push('b.slug = ?');
        params.push(brand);
    }
    if (ageMin) {
        conditions.push('p.age_min >= ?');
        params.push(Number(ageMin));
    }
    if (ageMax) {
        conditions.push('p.age_max <= ?');
        params.push(Number(ageMax));
    }
    if (minPrice) {
        conditions.push('p.price >= ?');
        params.push(Number(minPrice));
    }
    if (maxPrice) {
        conditions.push('p.price <= ?');
        params.push(Number(maxPrice));
    }
    if (featured) {
        conditions.push('p.is_featured = 1');
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
    SELECT p.*, c.name as category_name, b.name as brand_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    ${where}
    ORDER BY p.created_at DESC
    LIMIT 100
  `;
    try {
        const [rows] = await pool.query(sql, params);
        res.json(normalizeProducts(rows));
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// Product detail with reviews
app.get('/api/products/:slug', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE slug = ? LIMIT 1', [req.params.slug]);
        const products = rows;
        if (!products.length)
            return res.status(404).json({ error: 'Not found' });
        const product = products[0];
        if (typeof product.images === 'string') {
            try {
                product.images = JSON.parse(product.images);
            }
            catch {
                product.images = [];
            }
        }
        const [reviews] = await pool.query(`SELECT r.*, u.full_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC`, [product.id]);
        res.json({ ...product, reviews });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// Simple cart endpoints (in-memory for demo; real app would persist per user)
const carts = new Map();
function getCart(sessionId) {
    if (!carts.has(sessionId))
        carts.set(sessionId, []);
    return carts.get(sessionId);
}
app.post('/api/cart/add', async (req, res) => {
    const { sessionId, productId, quantity } = req.body;
    if (!sessionId || !productId || !quantity)
        return res.status(400).json({ error: 'Missing fields' });
    const cart = getCart(sessionId);
    const existing = cart.find(i => i.productId === productId);
    if (existing)
        existing.quantity += quantity;
    else
        cart.push({ productId, quantity });
    res.json({ cart });
});
app.post('/api/cart/remove', (req, res) => {
    const { sessionId, productId } = req.body;
    if (!sessionId || !productId)
        return res.status(400).json({ error: 'Missing fields' });
    const cart = getCart(sessionId).filter(i => i.productId !== productId);
    carts.set(sessionId, cart);
    res.json({ cart });
});
// Checkout: create order
app.post('/api/checkout', async (req, res) => {
    const { sessionId, userId, shippingAddress, paymentMethod } = req.body;
    if (!sessionId || !userId)
        return res.status(400).json({ error: 'Missing fields' });
    const cart = getCart(sessionId);
    if (!cart.length)
        return res.status(400).json({ error: 'Cart empty' });
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        let total = 0;
        for (const item of cart) {
            const [rows] = await conn.query('SELECT price, inventory FROM products WHERE id = ? FOR UPDATE', [item.productId]);
            const prod = rows[0];
            if (!prod || prod.inventory < item.quantity)
                throw new Error('Out of stock');
            total += prod.price * item.quantity;
        }
        const [orderResult] = await conn.query('INSERT INTO orders (user_id, status, total, shipping_address, payment_method) VALUES (?, "pending", ?, ?, ?)', [userId, total, JSON.stringify(shippingAddress || {}), paymentMethod || 'cod']);
        const orderId = orderResult.insertId;
        for (const item of cart) {
            const [rows] = await conn.query('SELECT price, inventory FROM products WHERE id = ? FOR UPDATE', [item.productId]);
            const prod = rows[0];
            await conn.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [orderId, item.productId, item.quantity, prod.price]);
            await conn.query('UPDATE products SET inventory = inventory - ? WHERE id = ?', [item.quantity, item.productId]);
        }
        await conn.commit();
        carts.set(sessionId, []);
        res.json({ ok: true, orderId });
    }
    catch (e) {
        await conn.rollback();
        res.status(400).json({ ok: false, error: e.message });
    }
    finally {
        conn.release();
    }
});
// Auth placeholders
app.post('/api/register', async (req, res) => {
    const { email, phone, password, fullName } = req.body;
    if (!email && !phone)
        return res.status(400).json({ error: 'Email or phone required' });
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.hash(password, 10);
    try {
        const [result] = await pool.query('INSERT INTO users (email, phone, password_hash, full_name) VALUES (?, ?, ?, ?)', [email, phone, hash, fullName]);
        res.json({ ok: true, userId: result.insertId });
    }
    catch (e) {
        res.status(400).json({ ok: false, error: e.message });
    }
});
app.post('/api/login', async (req, res) => {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password)
        return res.status(400).json({ error: 'Missing fields' });
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ? OR phone = ? LIMIT 1', [emailOrPhone, emailOrPhone]);
        const users = rows;
        if (!users.length)
            return res.status(400).json({ error: 'Invalid credentials' });
        const user = users[0];
        const bcrypt = await import('bcryptjs');
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok)
            return res.status(400).json({ error: 'Invalid credentials' });
        const jwt = await import('jsonwebtoken');
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role } });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// Orders for user
app.get('/api/orders', async (req, res) => {
    const userId = Number(req.query.userId);
    if (!userId)
        return res.status(400).json({ error: 'Missing userId' });
    try {
        const [orders] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.json(orders);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
