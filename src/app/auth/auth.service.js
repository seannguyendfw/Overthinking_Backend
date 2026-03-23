const db = require('../../../db');
const { hashPassword, comparePassword } = require('../../utils/bcrypt.util');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../utils/jwt.util');
const { sendMail } = require('../../utils/mailer.util');
const ERRORS = require('../../constants/errors');

class AuthService {
  /**
   * Register a new user.
   */
  async register({ full_name, email, password }) {
    const exists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      const err = new Error(ERRORS.EMAIL_TAKEN.message);
      err.statusCode = ERRORS.EMAIL_TAKEN.status;
      err.code = ERRORS.EMAIL_TAKEN.code;
      throw err;
    }

    const password_hash = await hashPassword(password);

    const { rows } = await db.query(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, full_name, email, role, status, created_at`,
      [full_name, email, password_hash]
    );

    return rows[0];
  }

  /**
   * Login — returns user + access_token (short-lived) + refresh_token (long-lived).
   */
  async login({ email, password }) {
    const { rows } = await db.query(
      'SELECT id, full_name, email, password_hash, role, status FROM users WHERE email = $1',
      [email]
    );

    const user = rows[0];
    if (!user) {
      const err = new Error(ERRORS.INVALID_CREDENTIALS.message);
      err.statusCode = ERRORS.INVALID_CREDENTIALS.status;
      err.code = ERRORS.INVALID_CREDENTIALS.code;
      throw err;
    }

    if (user.status === 'suspended') {
      const err = new Error(ERRORS.ACCOUNT_SUSPENDED.message);
      err.statusCode = ERRORS.ACCOUNT_SUSPENDED.status;
      err.code = ERRORS.ACCOUNT_SUSPENDED.code;
      throw err;
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      const err = new Error(ERRORS.INVALID_CREDENTIALS.message);
      err.statusCode = ERRORS.INVALID_CREDENTIALS.status;
      err.code = ERRORS.INVALID_CREDENTIALS.code;
      throw err;
    }

    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    const tokenPayload = { id: user.id, email: user.email, role: user.role, status: user.status };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    const { password_hash: _, ...safeUser } = user;
    return { user: safeUser, accessToken, refreshToken };
  }

  /**
   * Verify refresh token and return a new access token.
   */
  async refresh(refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const { iat, exp, ...payload } = decoded;

      // Ensure user still exists and is active
      const { rows } = await db.query(
        'SELECT id, email, role, status FROM users WHERE id = $1',
        [payload.id]
      );
      const user = rows[0];
      if (!user) {
        const err = new Error(ERRORS.USER_NOT_FOUND.message);
        err.statusCode = ERRORS.USER_NOT_FOUND.status;
        err.code = ERRORS.USER_NOT_FOUND.code;
        throw err;
      }
      if (user.status === 'suspended') {
        const err = new Error(ERRORS.ACCOUNT_SUSPENDED.message);
        err.statusCode = ERRORS.ACCOUNT_SUSPENDED.status;
        err.code = ERRORS.ACCOUNT_SUSPENDED.code;
        throw err;
      }

      const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role, status: user.status });
      return { accessToken };
    } catch (err) {
      if (err.code) throw err; // already a known error
      const e = new Error(ERRORS.TOKEN_INVALID.message);
      e.statusCode = ERRORS.TOKEN_INVALID.status;
      e.code = ERRORS.TOKEN_INVALID.code;
      throw e;
    }
  }

  /**
   * Forgot password — generate random password, update DB, send email.
   * Always returns { sent: boolean } and never throws (caller always returns 200).
   */
  async forgotPassword(email) {
    const { rows } = await db.query(
      'SELECT id, full_name, email, status FROM users WHERE email = $1',
      [email]
    );
    const user = rows[0];
    if (!user) {
      const err = new Error(ERRORS.USER_NOT_FOUND.message);
      err.statusCode = ERRORS.USER_NOT_FOUND.status;
      err.code = ERRORS.USER_NOT_FOUND.code;
      throw err;
    }

    // Generate a random 12-char password: upper + lower + digits + specials
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*';
    let newPassword = '';
    for (let i = 0; i < 12; i++) {
      newPassword += charset[Math.floor(Math.random() * charset.length)];
    }

    const password_hash = await hashPassword(newPassword);
    await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
      password_hash,
      user.id,
    ]);

    await sendMail({
      to: user.email,
      subject: '🔑 Mật khẩu mới của bạn — Overthinker App',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:12px;">
          <h2 style="color:#4f46e5;margin-bottom:8px;">Overthinker App</h2>
          <p style="color:#374151;">Xin chào <strong>${user.full_name}</strong>,</p>
          <p style="color:#374151;">Chúng tôi đã tạo mật khẩu mới cho tài khoản của bạn:</p>
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px 24px;text-align:center;margin:24px 0;">
            <span style="font-size:24px;font-weight:bold;letter-spacing:4px;color:#1f2937;font-family:monospace;">${newPassword}</span>
          </div>
          <p style="color:#6b7280;font-size:14px;">Vui lòng đăng nhập và đổi mật khẩu ngay sau khi nhận được email này.</p>
          <p style="color:#9ca3af;font-size:12px;margin-top:32px;">Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>
        </div>
      `,
    });

    return { sent: true };
  }

  /**
   * Get current user by id.
   */
  async getMe(userId) {
    const { rows } = await db.query(
      `SELECT id, full_name, email, role, status, last_login_at, created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    );
    return rows[0] || null;
  }
}

module.exports = new AuthService();
