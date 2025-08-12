import jwt from 'jsonwebtoken';
export function authenticateRequest(req, res, next) {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
        req.user = payload;
        next();
    }
    catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
export function requireAdmin(req, res, next) {
    const user = req.user;
    if (!user || user.role !== 'admin')
        return res.status(403).json({ error: 'Forbidden' });
    next();
}
