const { Router } = require('express');
const Joi = require('joi');
const { list, getById, create, update, remove, listSessions, createSession } = require('./challenges.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { validateBody, validateQuery } = require('../../middlewares/validate.middleware');
const { CATEGORY, CHALLENGE_STATUS } = require('../../constants/enums');

const router = Router();
router.use(authMiddleware);

const categoryValues = Object.values(CATEGORY);
const statusValues = Object.values(CHALLENGE_STATUS);

const createSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  category: Joi.string().valid(...categoryValues).required(),
});

const updateSchema = Joi.object({
  name: Joi.string().min(1).max(255),
  category: Joi.string().valid(...categoryValues),
  status: Joi.string().valid(...statusValues),
}).min(1);

const sessionCreateSchema = Joi.object({
  session_type: Joi.string().valid('thinking', 'executing').required(),
  session_date: Joi.string().isoDate().required(),
  start_time: Joi.string().pattern(/^\d{2}:\d{2}$/).optional().allow(null),
  end_time: Joi.string().pattern(/^\d{2}:\d{2}$/).optional().allow(null),
  total_minutes: Joi.number().integer().min(1).required(),
  note: Joi.string().max(100).optional().allow(null, ''),
});

const listQuerySchema = Joi.object({
  category: Joi.string().valid(...categoryValues),
  status: Joi.string().valid(...statusValues),
  search: Joi.string().max(255),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
});

/**
 * @openapi
 * tags:
 *   - name: Challenges
 *     description: Challenge management
 */

/**
 * @openapi
 * /api/v1/challenges:
 *   get:
 *     tags: [Challenges]
 *     summary: List own challenges
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string, enum: [health, career, relationships, personal_growth] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, in_progress, completed] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of challenges
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
router.get('/', validateQuery(listQuerySchema), list);

/**
 * @openapi
 * /api/v1/challenges:
 *   post:
 *     tags: [Challenges]
 *     summary: Create a new challenge
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category]
 *             properties:
 *               name: { type: string }
 *               category: { type: string, enum: [health, career, relationships, personal_growth] }
 *     responses:
 *       201:
 *         description: Challenge created
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
 */
router.post('/', validateBody(createSchema), create);

/**
 * @openapi
 * /api/v1/challenges/{id}:
 *   get:
 *     tags: [Challenges]
 *     summary: Get a challenge by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Challenge detail
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
 *       404: { description: Challenge not found }
 */
router.get('/:id', getById);

/**
 * @openapi
 * /api/v1/challenges/{id}:
 *   patch:
 *     tags: [Challenges]
 *     summary: Update a challenge
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
 *             properties:
 *               name: { type: string }
 *               category: { type: string, enum: [health, career, relationships, personal_growth] }
 *               status: { type: string, enum: [pending, in_progress, completed] }
 *     responses:
 *       200:
 *         description: Challenge updated
 *       404: { description: Challenge not found }
 */
router.patch('/:id', validateBody(updateSchema), update);

/**
 * @openapi
 * /api/v1/challenges/{id}:
 *   delete:
 *     tags: [Challenges]
 *     summary: Delete a challenge
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Deleted }
 *       404: { description: Not found }
 */
router.delete('/:id', remove);

/**
 * @openapi
 * /api/v1/challenges/{id}/sessions:
 *   get:
 *     tags: [Challenges]
 *     summary: List sessions of a challenge
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of sessions
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
router.get('/:id/sessions', listSessions);

/**
 * @openapi
 * /api/v1/challenges/{id}/sessions:
 *   post:
 *     tags: [Challenges]
 *     summary: Create a session for a challenge
 *     description: After creation, challenge totals are automatically recalculated. If challenge was pending it becomes in_progress.
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
 *             required: [session_type, session_date, total_minutes]
 *             properties:
 *               session_type: { type: string, enum: [thinking, executing] }
 *               session_date: { type: string, format: date }
 *               start_time: { type: string, example: "09:00", nullable: true }
 *               end_time: { type: string, example: "10:30", nullable: true }
 *               total_minutes: { type: integer, minimum: 1 }
 *               note: { type: string, maxLength: 100, nullable: true }
 *     responses:
 *       201:
 *         description: Session created
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
 *                         session: { $ref: '#/components/schemas/Session' }
 */
router.post('/:id/sessions', validateBody(sessionCreateSchema), createSession);

module.exports = router;
