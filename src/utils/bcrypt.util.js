const bcrypt = require('bcrypt');
const env = require('../configs/env');

/**
 * Hash a plain-text password.
 * @param {string} plain
 * @returns {Promise<string>}
 */
const hashPassword = (plain) => bcrypt.hash(plain, env.BCRYPT_ROUNDS);

/**
 * Compare a plain-text password against a stored hash.
 * @param {string} plain
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

module.exports = { hashPassword, comparePassword };
