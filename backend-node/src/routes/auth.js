const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const response = require('../response');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../middleware/auth');

const SALT_ROUNDS = 10;

function authRoutes(db, log) {
  function register(req, res) {
    try {
      const { username, password } = req.body || {};
      if (!username || !String(username).trim()) {
        return response.badRequest(res, '用户名不能为空');
      }
      if (!password || String(password).length < 6) {
        return response.badRequest(res, '密码长度不能少于 6 位');
      }
      if (String(password).length > 72) {
        return response.badRequest(res, '密码长度不能超过 72 位');
      }

      const trimmed = String(username).trim();

      // 检查是否已存在
      const existing = db.prepare('SELECT id FROM users WHERE username = ? AND deleted_at IS NULL').get(trimmed);
      if (existing) {
        return response.badRequest(res, '用户名已存在');
      }

      // 首个用户为 admin，后续为普通 user
      const count = db.prepare('SELECT COUNT(*) as cnt FROM users').get();
      const role = count.cnt === 0 ? 'admin' : 'user';

      const hash = bcrypt.hashSync(password, SALT_ROUNDS);
      const now = new Date().toISOString();
      const result = db.prepare(
        'INSERT INTO users (username, password, role, is_active, created_at, updated_at) VALUES (?, ?, ?, 1, ?, ?)'
      ).run(trimmed, hash, role, now, now);

      const user = db.prepare('SELECT id, username, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      log.info('auth register', { userId: user.id, username: user.username, role: user.role });
      response.created(res, { token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
      log.error('auth register', { error: err.message });
      response.internalError(res, '注册失败');
    }
  }

  function login(req, res) {
    try {
      const { username, password } = req.body || {};
      if (!username || !password) {
        return response.badRequest(res, '用户名和密码不能为空');
      }

      const trimmed = String(username).trim();
      const user = db.prepare('SELECT id, username, password, role, is_active FROM users WHERE username = ? AND deleted_at IS NULL').get(trimmed);
      if (!user) {
        return response.badRequest(res, '用户名或密码错误');
      }
      if (!user.is_active) {
        return response.forbidden(res, '账号已被禁用');
      }

      if (!bcrypt.compareSync(password, user.password)) {
        return response.badRequest(res, '用户名或密码错误');
      }

      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      log.info('auth login', { userId: user.id, username: user.username });
      response.success(res, { token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
      log.error('auth login', { error: err.message });
      response.internalError(res, '登录失败');
    }
  }

  function me(req, res) {
    try {
      const user = db.prepare('SELECT id, username, role, is_active, created_at, updated_at FROM users WHERE id = ? AND deleted_at IS NULL').get(req.user.id);
      if (!user) {
        return response.notFound(res, '用户不存在');
      }
      response.success(res, { id: user.id, username: user.username, role: user.role, created_at: user.created_at });
    } catch (err) {
      log.error('auth me', { error: err.message });
      response.internalError(res, '获取用户信息失败');
    }
  }

  return { register, login, me };
}

module.exports = authRoutes;
