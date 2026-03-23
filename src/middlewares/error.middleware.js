const ERRORS = require('../constants/errors');

/**
 * Global error handler middleware.
 * Must be registered last in Express middleware chain.
 */
// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  console.error('❌ Unhandled error:', err);

  // Joi / known errors
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: err.message },
    });
  }

  // pg unique violation
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: { code: 'CONFLICT', message: 'A record with this data already exists' },
    });
  }

  // Default 500
  return res.status(500).json({
    success: false,
    error: {
      code: ERRORS.INTERNAL_ERROR.code,
      message: ERRORS.INTERNAL_ERROR.message,
    },
  });
};

module.exports = errorMiddleware;
