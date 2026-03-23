const jwt = require('jsonwebtoken');
const env = require('../configs/env');

/**
 * Access token — short-lived (15m), returned in response body.
 */
const signAccessToken = (payload) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });

const verifyAccessToken = (token) => jwt.verify(token, env.JWT_ACCESS_SECRET);

/**
 * Refresh token — long-lived (7d), stored in HTTP-only cookie.
 */
const signRefreshToken = (payload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });

const verifyRefreshToken = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET);

module.exports = { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken };
