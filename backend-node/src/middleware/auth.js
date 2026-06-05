const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function authMiddleware(req, res, next) {
  // 白名单：注册和登录不需要 token（/health 在 app 层面定义，不在本 router 范围内）
  if (req.path === '/auth/register' || req.path === '/auth/login') {
    return next();
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: '缺少认证令牌' },
      timestamp: new Date().toISOString(),
    });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, username: payload.username, role: payload.role };
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? '令牌已过期，请重新登录' : '无效的认证令牌';
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message },
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = { authMiddleware, JWT_SECRET, JWT_EXPIRES_IN };
