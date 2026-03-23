const { sendError } = require('../helpers/response');
const ERRORS = require('../constants/errors');

/**
 * Factory: returns middleware that validates req.body against a Joi schema.
 * @param {import('joi').Schema} schema
 */
const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const message = error.details.map((d) => d.message).join('; ');
    return sendError(res, ERRORS.VALIDATION_ERROR, message);
  }
  req.body = value;
  next();
};

/**
 * Factory: validates req.query.
 * @param {import('joi').Schema} schema
 */
const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, { abortEarly: false, allowUnknown: true });
  if (error) {
    const message = error.details.map((d) => d.message).join('; ');
    return sendError(res, ERRORS.VALIDATION_ERROR, message);
  }
  req.query = value;
  next();
};

module.exports = { validateBody, validateQuery };
