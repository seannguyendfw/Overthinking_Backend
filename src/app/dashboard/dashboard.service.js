const db = require('../../../db');

class DashboardService {
  /**
   * All-challenges overview for a user.
   */
  async overview(userId) {
    const { rows: challenges } = await db.query(
      `SELECT id, name, category, status,
              total_thinking_minutes, total_executing_minutes,
              (total_thinking_minutes + total_executing_minutes) AS total_minutes,
              updated_at
       FROM challenges WHERE user_id = $1 ORDER BY updated_at DESC`,
      [userId]
    );

    const totalThinking  = challenges.reduce((s, c) => s + c.total_thinking_minutes, 0);
    const totalExecuting = challenges.reduce((s, c) => s + c.total_executing_minutes, 0);
    const totalTime      = totalThinking + totalExecuting;

    const sessionCountRes = await db.query(
      'SELECT COUNT(*) FROM sessions WHERE user_id = $1',
      [userId]
    );

    return {
      total_thinking_minutes:  totalThinking,
      total_executing_minutes: totalExecuting,
      total_minutes:           totalTime,
      thinking_percent:        totalTime > 0 ? parseFloat(((totalThinking / totalTime) * 100).toFixed(2)) : 0,
      executing_percent:       totalTime > 0 ? parseFloat(((totalExecuting / totalTime) * 100).toFixed(2)) : 0,
      ratio:                   totalExecuting > 0 ? parseFloat((totalThinking / totalExecuting).toFixed(2)) : null,
      total_challenges:        challenges.length,
      completed_challenges:    challenges.filter((c) => c.status === 'completed').length,
      total_sessions:          parseInt(sessionCountRes.rows[0].count, 10),
      challenges,
    };
  }

  /**
   * Per-challenge dashboard.
   */
  async challengeDashboard(challengeId, userId) {
    const challengeRes = await db.query(
      'SELECT * FROM challenges WHERE id = $1 AND user_id = $2',
      [challengeId, userId]
    );
    const challenge = challengeRes.rows[0];
    if (!challenge) return null;

    const sessionsRes = await db.query(
      `SELECT COUNT(*) AS total_sessions,
              MAX(session_date) AS last_session_date
       FROM sessions WHERE challenge_id = $1`,
      [challengeId]
    );

    const { total_thinking_minutes: tThink, total_executing_minutes: tExec } = challenge;
    const total = tThink + tExec;

    return {
      challenge,
      total_minutes:           total,
      thinking_percent:        total > 0 ? parseFloat(((tThink / total) * 100).toFixed(2)) : 0,
      executing_percent:       total > 0 ? parseFloat(((tExec  / total) * 100).toFixed(2)) : 0,
      ratio:                   tExec > 0 ? parseFloat((tThink / tExec).toFixed(2)) : null,
      total_sessions:          parseInt(sessionsRes.rows[0].total_sessions, 10),
      last_session_date:       sessionsRes.rows[0].last_session_date,
    };
  }

  /**
   * Per-category dashboard for a user.
   */
  async categoryDashboard(userId, category) {
    const { rows: challenges } = await db.query(
      `SELECT id, name, status, total_thinking_minutes, total_executing_minutes,
              (total_thinking_minutes + total_executing_minutes) AS total_minutes,
              updated_at
       FROM challenges
       WHERE user_id = $1 AND category = $2
       ORDER BY updated_at DESC`,
      [userId, category]
    );

    const totalThinking  = challenges.reduce((s, c) => s + c.total_thinking_minutes, 0);
    const totalExecuting = challenges.reduce((s, c) => s + c.total_executing_minutes, 0);
    const totalTime      = totalThinking + totalExecuting;

    // Last session date per challenge
    const challengeIds = challenges.map((c) => c.id);
    let lastSessionMap = {};
    if (challengeIds.length > 0) {
      const lsRes = await db.query(
        `SELECT challenge_id, MAX(session_date) AS last_session_date
         FROM sessions WHERE challenge_id = ANY($1)
         GROUP BY challenge_id`,
        [challengeIds]
      );
      lsRes.rows.forEach((r) => { lastSessionMap[r.challenge_id] = r.last_session_date; });
    }

    const enriched = challenges.map((c) => ({
      ...c,
      thinking_percent:  c.total_minutes > 0 ? parseFloat(((c.total_thinking_minutes / c.total_minutes) * 100).toFixed(2)) : 0,
      executing_percent: c.total_minutes > 0 ? parseFloat(((c.total_executing_minutes / c.total_minutes) * 100).toFixed(2)) : 0,
      last_session_date: lastSessionMap[c.id] || null,
    }));

    return {
      category,
      total_thinking_minutes:  totalThinking,
      total_executing_minutes: totalExecuting,
      total_minutes:           totalTime,
      thinking_percent:        totalTime > 0 ? parseFloat(((totalThinking / totalTime) * 100).toFixed(2)) : 0,
      executing_percent:       totalTime > 0 ? parseFloat(((totalExecuting / totalTime) * 100).toFixed(2)) : 0,
      ratio:                   totalExecuting > 0 ? parseFloat((totalThinking / totalExecuting).toFixed(2)) : null,
      total_challenges:        challenges.length,
      completed_challenges:    challenges.filter((c) => c.status === 'completed').length,
      challenges:              enriched,
    };
  }
}

module.exports = new DashboardService();
