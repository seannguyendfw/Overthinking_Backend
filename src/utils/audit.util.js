const db = require('../../db');

/**
 * Insert an audit log entry.
 * @param {object} params
 * @param {string|null} params.actorUserId
 * @param {string} params.actorRole - 'user' | 'admin'
 * @param {string} params.action    - e.g. 'CREATE_CHALLENGE'
 * @param {string} params.entityType - e.g. 'challenges'
 * @param {string|null} params.entityId
 * @param {object|null} params.metadata
 */
const logAudit = async ({ actorUserId, actorRole, action, entityType, entityId = null, metadata = null }) => {
  try {
    await db.query(
      `INSERT INTO audit_logs (actor_user_id, actor_role, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [actorUserId, actorRole, action, entityType, entityId, metadata ? JSON.stringify(metadata) : null]
    );
  } catch (err) {
    // Audit log failures should not break the main flow
    console.error('⚠️ Audit log failed:', err.message);
  }
};

module.exports = { logAudit };
