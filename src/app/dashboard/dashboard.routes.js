const { Router } = require('express');
const { overview, challengeDashboard, categoryDashboard } = require('./dashboard.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = Router();
router.use(authMiddleware);

/**
 * @openapi
 * tags:
 *   - name: Dashboard
 *     description: Aggregated dashboard data for end users
 */

/**
 * @openapi
 * /api/v1/dashboard/overview:
 *   get:
 *     tags: [Dashboard]
 *     summary: All-challenges overview dashboard
 *     description: Returns aggregated thinking/executing totals, percentages, ratios and all challenges for the current user.
 *     responses:
 *       200:
 *         description: Overview dashboard data
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
 *                         total_thinking_minutes: { type: integer }
 *                         total_executing_minutes: { type: integer }
 *                         total_minutes: { type: integer }
 *                         thinking_percent: { type: number }
 *                         executing_percent: { type: number }
 *                         ratio: { type: number, nullable: true }
 *                         total_challenges: { type: integer }
 *                         completed_challenges: { type: integer }
 *                         total_sessions: { type: integer }
 *                         challenges:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/Challenge' }
 */
router.get('/overview', overview);

/**
 * @openapi
 * /api/v1/dashboard/challenges/{id}:
 *   get:
 *     tags: [Dashboard]
 *     summary: Per-challenge dashboard
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Challenge dashboard data
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
 *                         challenge: { $ref: '#/components/schemas/Challenge' }
 *                         total_minutes: { type: integer }
 *                         thinking_percent: { type: number }
 *                         executing_percent: { type: number }
 *                         ratio: { type: number, nullable: true }
 *                         total_sessions: { type: integer }
 *                         last_session_date: { type: string, format: date, nullable: true }
 *       404: { description: Challenge not found }
 */
router.get('/challenges/:id', challengeDashboard);

/**
 * @openapi
 * /api/v1/dashboard/categories/{category}:
 *   get:
 *     tags: [Dashboard]
 *     summary: Per-category dashboard
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema: { type: string, enum: [health, career, relationships, personal_growth] }
 *     responses:
 *       200:
 *         description: Category dashboard data
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
 *                         category: { type: string }
 *                         total_thinking_minutes: { type: integer }
 *                         total_executing_minutes: { type: integer }
 *                         total_minutes: { type: integer }
 *                         thinking_percent: { type: number }
 *                         executing_percent: { type: number }
 *                         ratio: { type: number, nullable: true }
 *                         total_challenges: { type: integer }
 *                         completed_challenges: { type: integer }
 *                         challenges:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/Challenge' }
 */
router.get('/categories/:category', categoryDashboard);

module.exports = router;
