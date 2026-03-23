const challengesService = require('./challenges.service');
const sessionsService = require('../sessions/sessions.service');
const { sendSuccess, sendError } = require('../../helpers/response');
const { parsePagination, buildPaginationMeta } = require('../../helpers/pagination');
const { logAudit } = require('../../utils/audit.util');
const ERRORS = require('../../constants/errors');

const list = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { category, status, search } = req.query;
    const { challenges, total } = await challengesService.list(req.user.id, { category, status, search, limit, offset });
    return sendSuccess(res, { challenges }, buildPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const challenge = await challengesService.getById(req.params.id, req.user.id);
    if (!challenge) return sendError(res, ERRORS.CHALLENGE_NOT_FOUND);
    return sendSuccess(res, { challenge });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const challenge = await challengesService.create(req.user.id, req.body);
    await logAudit({ actorUserId: req.user.id, actorRole: req.user.role, action: 'CREATE_CHALLENGE', entityType: 'challenges', entityId: challenge.id });
    return sendSuccess(res, { challenge }, null, 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const challenge = await challengesService.update(req.params.id, req.user.id, req.body);
    if (!challenge) return sendError(res, ERRORS.CHALLENGE_NOT_FOUND);
    await logAudit({ actorUserId: req.user.id, actorRole: req.user.role, action: 'UPDATE_CHALLENGE', entityType: 'challenges', entityId: challenge.id });
    return sendSuccess(res, { challenge });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const deleted = await challengesService.delete(req.params.id, req.user.id);
    if (!deleted) return sendError(res, ERRORS.CHALLENGE_NOT_FOUND);
    await logAudit({ actorUserId: req.user.id, actorRole: req.user.role, action: 'DELETE_CHALLENGE', entityType: 'challenges', entityId: req.params.id });
    return sendSuccess(res, { message: 'Challenge deleted' });
  } catch (err) { next(err); }
};

// --- Sessions sub-resource ---
const listSessions = async (req, res, next) => {
  try {
    const challenge = await challengesService.getById(req.params.id, req.user.id);
    if (!challenge) return sendError(res, ERRORS.CHALLENGE_NOT_FOUND);
    const { page, limit, offset } = parsePagination(req.query);
    const { sessions, total } = await sessionsService.listByChallenge(req.params.id, { limit, offset });
    return sendSuccess(res, { sessions }, buildPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
};

const createSession = async (req, res, next) => {
  try {
    const challenge = await challengesService.getById(req.params.id, req.user.id);
    if (!challenge) return sendError(res, ERRORS.CHALLENGE_NOT_FOUND);
    const session = await sessionsService.create(req.params.id, req.user.id, challenge.category, req.body);
    await challengesService.recalculate(req.params.id);
    await logAudit({ actorUserId: req.user.id, actorRole: req.user.role, action: 'CREATE_SESSION', entityType: 'sessions', entityId: session.id });
    return sendSuccess(res, { session }, null, 201);
  } catch (err) { next(err); }
};

module.exports = { list, getById, create, update, remove, listSessions, createSession };
