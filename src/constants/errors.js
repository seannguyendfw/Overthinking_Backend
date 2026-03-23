const ERRORS = Object.freeze({
  // Auth
  INVALID_CREDENTIALS: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect', status: 401 },
  UNAUTHORIZED: { code: 'UNAUTHORIZED', message: 'Authentication required', status: 401 },
  FORBIDDEN: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action', status: 403 },
  ACCOUNT_SUSPENDED: { code: 'ACCOUNT_SUSPENDED', message: 'Your account has been suspended', status: 403 },
  EMAIL_TAKEN: { code: 'EMAIL_TAKEN', message: 'This email is already registered', status: 409 },
  TOKEN_INVALID: { code: 'TOKEN_INVALID', message: 'Invalid or expired token', status: 401 },

  // Validation
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', message: 'Invalid request payload', status: 400 },

  // Resources
  NOT_FOUND: { code: 'NOT_FOUND', message: 'Resource not found', status: 404 },
  CHALLENGE_NOT_FOUND: { code: 'CHALLENGE_NOT_FOUND', message: 'Challenge not found', status: 404 },
  SESSION_NOT_FOUND: { code: 'SESSION_NOT_FOUND', message: 'Session not found', status: 404 },
  USER_NOT_FOUND: { code: 'USER_NOT_FOUND', message: 'User not found', status: 404 },

  // Business rules
  NOTE_TOO_LONG: { code: 'NOTE_TOO_LONG', message: 'Note must be 100 characters or fewer', status: 400 },
  INVALID_TOTAL_MINUTES: { code: 'INVALID_TOTAL_MINUTES', message: 'total_minutes must be greater than 0', status: 400 },

  // Server
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred', status: 500 },
});

module.exports = ERRORS;
