const db = require('../../../db');

class SessionsService {
  /**
   * List sessions for a challenge (paginated).
   */
  async listByChallenge(challengeId, { limit, offset }) {
    const countRes = await db.query(
      'SELECT COUNT(*) FROM sessions WHERE challenge_id = $1',
      [challengeId]
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const { rows } = await db.query(
      `SELECT * FROM sessions WHERE challenge_id = $1
       ORDER BY session_date DESC, created_at DESC
       LIMIT $2 OFFSET $3`,
      [challengeId, limit, offset]
    );

    return { sessions: rows, total };
  }

  /**
   * Create a session for a challenge.
   */
  async create(challengeId, userId, category, { session_type, session_date, start_time, end_time, total_minutes, note }) {
    const { rows } = await db.query(
      `INSERT INTO sessions
         (challenge_id, user_id, category, session_type, session_date, start_time, end_time, total_minutes, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [challengeId, userId, category, session_type, session_date, start_time || null, end_time || null, total_minutes, note || null]
    );
    return rows[0];
  }

  /**
   * Get a session by id (must belong to user).
   */
  async getById(id, userId) {
    const { rows } = await db.query(
      'SELECT * FROM sessions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return rows[0] || null;
  }

  /**
   * Update a session.
   */
  async update(id, userId, fields) {
    const allowed = ['session_type', 'session_date', 'start_time', 'end_time', 'total_minutes', 'note'];
    const sets = [];
    const params = [];
    let idx = 1;

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        sets.push(`${key} = $${idx++}`);
        params.push(fields[key] === '' ? null : fields[key]);
      }
    }

    if (sets.length === 0) return null;

    params.push(id, userId);
    const { rows } = await db.query(
      `UPDATE sessions SET ${sets.join(', ')}
       WHERE id = $${idx++} AND user_id = $${idx}
       RETURNING *`,
      params
    );
    return rows[0] || null;
  }

  /**
   * Delete a session.
   */
  async delete(id, userId) {
    const { rows, rowCount } = await db.query(
      'DELETE FROM sessions WHERE id = $1 AND user_id = $2 RETURNING challenge_id',
      [id, userId]
    );
    return rowCount > 0 ? rows[0].challenge_id : null;
  }
}

module.exports = new SessionsService();
