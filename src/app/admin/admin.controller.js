const adminService = require('./admin.service');
const { sendSuccess, sendError } = require('../../helpers/response');
const { parsePagination, buildPaginationMeta } = require('../../helpers/pagination');
const { logAudit } = require('../../utils/audit.util');
const ERRORS = require('../../constants/errors');

const listUsers = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { status, search } = req.query;
    const { users, total } = await adminService.listUsers({ limit, offset, status, search });
    return sendSuccess(res, { users }, buildPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await adminService.getUserById(req.params.id);
    if (!user) return sendError(res, ERRORS.USER_NOT_FOUND);
    return sendSuccess(res, { user });
  } catch (err) { next(err); }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const user = await adminService.updateUserStatus(req.params.id, req.body.status);
    if (!user) return sendError(res, ERRORS.USER_NOT_FOUND);
    await logAudit({ actorUserId: req.user.id, actorRole: req.user.role, action: 'UPDATE_USER_STATUS', entityType: 'users', entityId: req.params.id, metadata: { status: req.body.status } });
    return sendSuccess(res, { user });
  } catch (err) { next(err); }
};

const listChallenges = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { category, status } = req.query;
    const { challenges, total } = await adminService.listChallenges({ limit, offset, category, status });
    return sendSuccess(res, { challenges }, buildPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
};

const listSessions = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { sessions, total } = await adminService.listSessions({ limit, offset });
    return sendSuccess(res, { sessions }, buildPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
};

const getDashboardSummary = async (req, res, next) => {
  try {
    const summary = await adminService.getDashboardSummary();
    return sendSuccess(res, summary);
  } catch (err) { next(err); }
};

const listAuditLogs = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { audit_logs, total } = await adminService.listAuditLogs({ limit, offset });
    return sendSuccess(res, { audit_logs }, buildPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
};

module.exports = { listUsers, getUserById, updateUserStatus, listChallenges, listSessions, getDashboardSummary, listAuditLogs };
