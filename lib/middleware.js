import { verifyToken, getTokenFromHeader, verifyAdminPassword } from './auth';

export function withAuth(handler) {
  return async (req, res) => {
    const token = getTokenFromHeader(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = decoded;
    return handler(req, res);
  };
}

export function withAdminAuth(handler) {
  return async (req, res) => {
    const authHeader = req.headers.authorization;
    const password = req.body?.password;

    if (!password || !verifyAdminPassword(password)) {
      return res.status(401).json({ error: 'Invalid admin password' });
    }

    req.user = { userId: 999, isAdmin: true };
    return handler(req, res);
  };
}

export function withAuthOrAdmin(handler) {
  return async (req, res) => {
    const token = getTokenFromHeader(req.headers.authorization);
    const password = req.body?.adminPassword;

    if (password && verifyAdminPassword(password)) {
      req.user = { userId: 999, isAdmin: true };
      return handler(req, res);
    }

    if (!token) {
      return res.status(401).json({ error: 'Missing authorization' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = decoded;
    return handler(req, res);
  };
}
