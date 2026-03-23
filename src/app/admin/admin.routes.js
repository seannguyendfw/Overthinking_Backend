const { Router } = require('express');
const Joi = require('joi');
const {
  listUsers, getUserById, updateUserStatus,
  listChallenges, listSessions, getDashboardSummary, listAuditLogs,
} = require('./admin.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const adminMiddleware = require('../../middlewares/admin.middleware');
const { validateBody, validateQuery } = require('../../middlewares/validate.middleware');

const router = Router();
router.use(authMiddleware, adminMiddleware);

const usersQuerySchema = Joi.object({
  status: Joi.string().valid('active', 'suspended'),
  search: Joi.string().max(255),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'suspended').required(),
});

/**
 * @openapi
 * tags:
 *   - name: Admin
 *     description: Admin-only endpoints (requires admin role)
 */

/**
 * @openapi
 * /api/v1/admin/dashboard/summary:
 *   get:
 *     tags: [Admin]
 *     summary: System metrics summary
 *     responses:
 *       200:
 *         description: Admin dashboard summary
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         total_users: { type: integer }
 *                         active_users: { type: integer }
 *                         total_challenges: { type: integer }
 *                         total_sessions: { type: integer }
 *                         total_thinking_minutes: { type: integer }
 *                         total_executing_minutes: { type: integer }
 */
router.get('/dashboard/summary', getDashboardSummary);

/**
 * @openapi
 * /api/v1/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users (paginated)
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, suspended] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         users:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/User' }
 *                     meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/users', validateQuery(usersQuerySchema), listUsers);

/**
 * @openapi
 * /api/v1/admin/users/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get user detail with stats
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User detail
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           allOf:
 *                             - $ref: '#/components/schemas/User'
 *                             - type: object
 *                               properties:
 *                                 total_challenges: { type: integer }
 *                                 total_sessions: { type: integer }
 *       404: { description: User not found }
 */
router.get('/users/:id', getUserById);

/**
 * @openapi
 * /api/v1/admin/users/{id}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Update user status (activate or suspend)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [active, suspended] }
 *     responses:
 *       200:
 *         description: Status updated
 *       404: { description: User not found }
 */
router.patch('/users/:id/status', validateBody(updateStatusSchema), updateUserStatus);

/**
 * @openapi
 * /api/v1/admin/challenges:
 *   get:
 *     tags: [Admin]
 *     summary: List all challenges (paginated)
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string, enum: [health, career, relationships, personal_growth] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, in_progress, completed] }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of challenges with user info
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         challenges:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/Challenge' }
 *                     meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/challenges', listChallenges);

/**
 * @openapi
 * /api/v1/admin/sessions:
 *   get:
 *     tags: [Admin]
 *     summary: List all sessions (paginated)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of sessions with user and challenge info
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         sessions:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/Session' }
 *                     meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/sessions', listSessions);

/**
 * @openapi
 * /api/v1/admin/audit-logs:
 *   get:
 *     tags: [Admin]
 *     summary: List audit logs (paginated)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Audit log entries
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         audit_logs:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/AuditLog' }
 *                     meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/audit-logs', listAuditLogs);

module.exports = router;
