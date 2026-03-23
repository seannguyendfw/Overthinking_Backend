/**
 * Parse pagination params from query string.
 * @param {object} query - req.query
 * @param {number} [defaultLimit=20]
 */
const parsePagination = (query, defaultLimit = 20) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * Build pagination meta for response.
 * @param {number} total - total records
 * @param {number} page
 * @param {number} limit
 */
const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});

module.exports = { parsePagination, buildPaginationMeta };
