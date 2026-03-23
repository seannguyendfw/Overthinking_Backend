const ERRORS = require('../constants/errors');
const { sendError } = require('../helpers/response');
const { USER_ROLE } = require('../constants/enums');

/**
 * Require req.user.role === 'admin'.
 * Must be placed AFTER authMiddleware.
 */
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== USER_ROLE.ADMIN) {
    return sendError(res, ERRORS.FORBIDDEN);
  }
  next();
};

module.exports = adminMiddleware;
