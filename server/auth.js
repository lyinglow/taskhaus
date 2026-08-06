import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getAsync, runAsync } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId, isAdmin = false) {
  return jwt.sign({ userId, isAdmin }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

export async function registerParent(name, email, password, phone = '', address = '') {
  const passwordHash = await hashPassword(password);
  const result = await runAsync(
    `INSERT INTO parents (name, email, password_hash, phone, address)
     VALUES (?, ?, ?, ?, ?)`,
    [name, email, passwordHash, phone, address]
  );
  return result.lastID;
}

export async function loginParent(email, password) {
  const parent = await getAsync('SELECT * FROM parents WHERE email = ?', [email]);
  if (!parent) return null;

  const passwordMatch = await comparePassword(password, parent.password_hash);
  if (!passwordMatch) return null;

  return parent;
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = decoded;
  next();
}

export function adminMiddleware(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
