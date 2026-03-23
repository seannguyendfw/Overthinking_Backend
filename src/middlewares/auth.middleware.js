const { verifyAccessToken } = require('../utils/jwt.util');
const ERRORS = require('../constants/errors');
const { sendError } = require('../helpers/response');
const { USER_STATUS } = require('../constants/enums');

/**
 * Authenticate request via Bearer access token in Authorization header.
 * Attaches decoded user to req.user.
 *
 * Header format: Authorization: Bearer <access_token>
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return sendError(res, ERRORS.UNAUTHORIZED);
  }

  try {
    const decoded = verifyAccessToken(token);
    if (decoded.status === USER_STATUS.SUSPENDED) {
      return sendError(res, ERRORS.ACCOUNT_SUSPENDED);
    }
    req.user = decoded;
    next();
  } catch {
    return sendError(res, ERRORS.TOKEN_INVALID);
  }
};

module.exports = authMiddleware;
