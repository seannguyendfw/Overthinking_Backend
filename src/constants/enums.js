const CATEGORY = Object.freeze({
  HEALTH: 'health',
  CAREER: 'career',
  RELATIONSHIPS: 'relationships',
  PERSONAL_GROWTH: 'personal_growth',
});

const CHALLENGE_STATUS = Object.freeze({
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
});

const SESSION_TYPE = Object.freeze({
  THINKING: 'thinking',
  EXECUTING: 'executing',
});

const USER_ROLE = Object.freeze({
  USER: 'user',
  ADMIN: 'admin',
});

const USER_STATUS = Object.freeze({
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
});

module.exports = { CATEGORY, CHALLENGE_STATUS, SESSION_TYPE, USER_ROLE, USER_STATUS };
