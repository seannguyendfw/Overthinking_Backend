const { Router } = require('express');
const Joi = require('joi');
const { update, remove } = require('./sessions.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { validateBody } = require('../../middlewares/validate.middleware');

const router = Router();
router.use(authMiddleware);

const updateSchema = Joi.object({
  session_type: Joi.string().valid('thinking', 'executing'),
  session_date: Joi.string().isoDate(),
  start_time: Joi.string().pattern(/^\d{2}:\d{2}$/).allow(null, ''),
  end_time: Joi.string().pattern(/^\d{2}:\d{2}$/).allow(null, ''),
  total_minutes: Joi.number().integer().min(1),
  note: Joi.string().max(100).allow(null, ''),
}).min(1);

/**
 * @openapi
 * tags:
 *   - name: Sessions
 *     description: Session management (standalone update/delete)
 */

/**
 * @openapi
 * /api/v1/sessions/{id}:
 *   patch:
 *     tags: [Sessions]
 *     summary: Update a session
 *     description: Updates session fields and recalculates parent challenge totals.
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
 *               session_type: { type: string, enum: [thinking, executing] }
 *               session_date: { type: string, format: date }
 *               start_time: { type: string, nullable: true }
 *               end_time: { type: string, nullable: true }
 *               total_minutes: { type: integer, minimum: 1 }
 *               note: { type: string, maxLength: 100, nullable: true }
 *     responses:
 *       200:
 *         description: Session updated
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
 *       404: { description: Session not found }
 */
router.patch('/:id', validateBody(updateSchema), update);

/**
 * @openapi
 * /api/v1/sessions/{id}:
 *   delete:
 *     tags: [Sessions]
 *     summary: Delete a session
 *     description: Deletes session and recalculates parent challenge totals.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Session deleted }
 *       404: { description: Session not found }
 */
router.delete('/:id', remove);

module.exports = router;
