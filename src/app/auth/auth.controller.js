const authService = require('./auth.service');
const { sendSuccess, sendError } = require('../../helpers/response');
const ERRORS = require('../../constants/errors');
const env = require('../../configs/env');

const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    return sendSuccess(res, { user }, null, 201);
  } catch (err) {
    if (err.code === ERRORS.EMAIL_TAKEN.code) return sendError(res, ERRORS.EMAIL_TAKEN);
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    // Refresh token → HTTP-only cookie (browser handles silently)
    res.cookie('refresh_token', refreshToken, REFRESH_COOKIE_OPTS);
    // Access token → response body (frontend stores in memory / localStorage)
    return sendSuccess(res, { user, access_token: accessToken });
  } catch (err) {
    if (err.code === ERRORS.INVALID_CREDENTIALS.code) return sendError(res, ERRORS.INVALID_CREDENTIALS);
    if (err.code === ERRORS.ACCOUNT_SUSPENDED.code) return sendError(res, ERRORS.ACCOUNT_SUSPENDED);
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const token = req.cookies && req.cookies.refresh_token;
    if (!token) return sendError(res, ERRORS.UNAUTHORIZED);
    const { accessToken } = await authService.refresh(token);
    return sendSuccess(res, { access_token: accessToken });
  } catch (err) {
    if (err.code === ERRORS.TOKEN_INVALID.code) return sendError(res, ERRORS.TOKEN_INVALID);
    if (err.code === ERRORS.USER_NOT_FOUND.code) return sendError(res, ERRORS.USER_NOT_FOUND);
    if (err.code === ERRORS.ACCOUNT_SUSPENDED.code) return sendError(res, ERRORS.ACCOUNT_SUSPENDED);
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email);
    return sendSuccess(res, { message: 'A new password has been sent to your email.' });
  } catch (err) {
    if (err.code === ERRORS.USER_NOT_FOUND.code) return sendError(res, ERRORS.USER_NOT_FOUND);
    next(err);
  }
};

const logout = (req, res) => {
  res.clearCookie('refresh_token');
  return sendSuccess(res, { message: 'Logged out successfully' });
};

const me = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    if (!user) return sendError(res, ERRORS.USER_NOT_FOUND);
    return sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, forgotPassword, logout, me };
