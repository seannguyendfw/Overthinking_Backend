const db = require('../../../db');
const { CHALLENGE_STATUS } = require('../../constants/enums');

class ChallengesService {
  /**
   * List challenges for a user with optional filters.
   */
  async list(userId, { category, status, search, limit, offset }) {
    const conditions = ['c.user_id = $1'];
    const params = [userId];
    let idx = 2;

    if (category) { conditions.push(`c.category = $${idx++}`); params.push(category); }
    if (status)   { conditions.push(`c.status = $${idx++}`);   params.push(status); }
    if (search)   { conditions.push(`c.name ILIKE $${idx++}`); params.push(`%${search}%`); }

    const where = conditions.join(' AND ');

    const countRes = await db.query(`SELECT COUNT(*) FROM challenges c WHERE ${where}`, params);
    const total = parseInt(countRes.rows[0].count, 10);

    params.push(limit, offset);
    const { rows } = await db.query(
      `SELECT * FROM challenges c WHERE ${where}
       ORDER BY c.updated_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );

    return { challenges: rows, total };
  }

  /**
   * Get a challenge by id (must belong to user).
   */
  async getById(id, userId) {
    const { rows } = await db.query(
      'SELECT * FROM challenges WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return rows[0] || null;
  }

  /**
   * Create a new challenge.
   */
  async create(userId, { name, category }) {
    const { rows } = await db.query(
      `INSERT INTO challenges (user_id, name, category)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, name, category]
    );
    return rows[0];
  }

  /**
   * Update a challenge.
   */
  async update(id, userId, fields) {
    const allowed = ['name', 'category', 'status'];
    const sets = [];
    const params = [];
    let idx = 1;

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        sets.push(`${key} = $${idx++}`);
        params.push(fields[key]);
      }
    }

    // Handle completed_at
    if (fields.status === CHALLENGE_STATUS.COMPLETED) {
      sets.push(`completed_at = NOW()`);
    } else if (fields.status && fields.status !== CHALLENGE_STATUS.COMPLETED) {
      sets.push(`completed_at = NULL`);
    }

    if (sets.length === 0) return null;

    params.push(id, userId);
    const { rows } = await db.query(
      `UPDATE challenges SET ${sets.join(', ')}
       WHERE id = $${idx++} AND user_id = $${idx}
       RETURNING *`,
      params
    );
    return rows[0] || null;
  }

  /**
   * Delete a challenge.
   */
  async delete(id, userId) {
    const { rowCount } = await db.query(
      'DELETE FROM challenges WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return rowCount > 0;
  }

  /**
   * Recalculate total_thinking_minutes and total_executing_minutes
   * for a challenge. Called after any session change.
   * Also auto-transitions status from pending -> in_progress on first session.
   */
  async recalculate(challengeId) {
    await db.query(
      `UPDATE challenges SET
         total_thinking_minutes  = COALESCE((
           SELECT SUM(total_minutes) FROM sessions
           WHERE challenge_id = $1 AND session_type = 'thinking'
         ), 0),
         total_executing_minutes = COALESCE((
           SELECT SUM(total_minutes) FROM sessions
           WHERE challenge_id = $1 AND session_type = 'executing'
         ), 0),
         status = CASE
           WHEN status = 'pending' AND EXISTS (
             SELECT 1 FROM sessions WHERE challenge_id = $1
           ) THEN 'in_progress'::challenge_status
           ELSE status
         END
       WHERE id = $1`,
      [challengeId]
    );
  }
}

module.exports = new ChallengesService();
