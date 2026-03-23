const db = require('../../../db');

class AdminService {
  async listUsers({ limit, offset, status, search }) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (status) { conditions.push(`status = $${idx++}`); params.push(status); }
    if (search) { conditions.push(`(full_name ILIKE $${idx} OR email ILIKE $${idx++})`); params.push(`%${search}%`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRes = await db.query(`SELECT COUNT(*) FROM users ${where}`, params);
    const total = parseInt(countRes.rows[0].count, 10);

    params.push(limit, offset);
    const { rows } = await db.query(
      `SELECT id, full_name, email, role, status, last_login_at, created_at, updated_at
       FROM users ${where}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );

    return { users: rows, total };
  }

  async getUserById(id) {
    const { rows } = await db.query(
      `SELECT u.id, u.full_name, u.email, u.role, u.status, u.last_login_at, u.created_at, u.updated_at,
              COUNT(DISTINCT c.id) AS total_challenges,
              COUNT(DISTINCT s.id) AS total_sessions
       FROM users u
       LEFT JOIN challenges c ON c.user_id = u.id
       LEFT JOIN sessions s ON s.user_id = u.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [id]
    );
    return rows[0] || null;
  }

  async updateUserStatus(id, status) {
    const { rows } = await db.query(
      `UPDATE users SET status = $1 WHERE id = $2
       RETURNING id, full_name, email, role, status, updated_at`,
      [status, id]
    );
    return rows[0] || null;
  }

  async listChallenges({ limit, offset, category, status }) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (category) { conditions.push(`c.category = $${idx++}`); params.push(category); }
    if (status)   { conditions.push(`c.status = $${idx++}`);   params.push(status); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRes = await db.query(`SELECT COUNT(*) FROM challenges c ${where}`, params);
    const total  = parseInt(countRes.rows[0].count, 10);

    params.push(limit, offset);
    const { rows } = await db.query(
      `SELECT c.*, u.full_name AS user_name, u.email AS user_email
       FROM challenges c
       JOIN users u ON u.id = c.user_id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );

    return { challenges: rows, total };
  }

  async listSessions({ limit, offset }) {
    const countRes = await db.query('SELECT COUNT(*) FROM sessions');
    const total = parseInt(countRes.rows[0].count, 10);

    const { rows } = await db.query(
      `SELECT s.*, u.full_name AS user_name, c.name AS challenge_name
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       JOIN challenges c ON c.id = s.challenge_id
       ORDER BY s.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return { sessions: rows, total };
  }

  async getDashboardSummary() {
    const [usersRes, challengesRes, sessionsRes, timesRes] = await Promise.all([
      db.query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active FROM users WHERE role='user'`),
      db.query(`SELECT COUNT(*) AS total FROM challenges`),
      db.query(`SELECT COUNT(*) AS total FROM sessions`),
      db.query(`SELECT COALESCE(SUM(total_thinking_minutes),0) AS thinking, COALESCE(SUM(total_executing_minutes),0) AS executing FROM challenges`),
    ]);

    return {
      total_users:              parseInt(usersRes.rows[0].total, 10),
      active_users:             parseInt(usersRes.rows[0].active, 10),
      total_challenges:         parseInt(challengesRes.rows[0].total, 10),
      total_sessions:           parseInt(sessionsRes.rows[0].total, 10),
      total_thinking_minutes:   parseInt(timesRes.rows[0].thinking, 10),
      total_executing_minutes:  parseInt(timesRes.rows[0].executing, 10),
    };
  }

  async listAuditLogs({ limit, offset }) {
    const countRes = await db.query('SELECT COUNT(*) FROM audit_logs');
    const total = parseInt(countRes.rows[0].count, 10);

    const { rows } = await db.query(
      `SELECT al.*, u.full_name AS actor_name, u.email AS actor_email
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.actor_user_id
       ORDER BY al.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return { audit_logs: rows, total };
  }
}

module.exports = new AdminService();
