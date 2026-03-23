/**
 * Send a standardized success response.
 * @param {import('express').Response} res
 * @param {*} data
 * @param {object} [meta] - optional pagination or extra info
 * @param {number} [statusCode=200]
 */
const sendSuccess = (res, data, meta = null, statusCode = 200) => {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

/**
 * Send a standardized error response.
 * @param {import('express').Response} res
 * @param {object} errorDef - from constants/errors.js
 * @param {string} [overrideMessage]
 */
const sendError = (res, errorDef, overrideMessage) => {
  return res.status(errorDef.status).json({
    success: false,
    error: {
      code: errorDef.code,
      message: overrideMessage || errorDef.message,
    },
  });
};

module.exports = { sendSuccess, sendError };
