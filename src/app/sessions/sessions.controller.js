const sessionsService = require('./sessions.service');
const challengesService = require('../challenges/challenges.service');
const { sendSuccess, sendError } = require('../../helpers/response');
const { logAudit } = require('../../utils/audit.util');
const ERRORS = require('../../constants/errors');

const update = async (req, res, next) => {
  try {
    const session = await sessionsService.update(req.params.id, req.user.id, req.body);
    if (!session) return sendError(res, ERRORS.SESSION_NOT_FOUND);
    await challengesService.recalculate(session.challenge_id);
    await logAudit({ actorUserId: req.user.id, actorRole: req.user.role, action: 'UPDATE_SESSION', entityType: 'sessions', entityId: session.id });
    return sendSuccess(res, { session });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const challengeId = await sessionsService.delete(req.params.id, req.user.id);
    if (!challengeId) return sendError(res, ERRORS.SESSION_NOT_FOUND);
    await challengesService.recalculate(challengeId);
    await logAudit({ actorUserId: req.user.id, actorRole: req.user.role, action: 'DELETE_SESSION', entityType: 'sessions', entityId: req.params.id });
    return sendSuccess(res, { message: 'Session deleted' });
  } catch (err) { next(err); }
};

module.exports = { update, remove };
