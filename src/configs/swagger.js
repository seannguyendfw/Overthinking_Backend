const swaggerJsdoc = require('swagger-jsdoc');
const env = require('./env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Overthinker Action Tracker API',
      version: '1.0.0',
      description:
        'REST API for Overthinker Action Tracker — track Thinking vs Executing time on challenges across 4 categories.',
      contact: { name: 'Overthinker Team' },
    },
    servers: [
      { url: `http://localhost:${env.PORT}`, description: 'Local Development' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Short-lived access token (15 min). Obtain from POST /auth/login response body.',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Invalid request payload' },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            full_name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['user', 'admin'] },
            status: { type: 'string', enum: ['active', 'suspended'] },
            last_login_at: { type: 'string', format: 'date-time', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Challenge: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            category: { type: 'string', enum: ['health', 'career', 'relationships', 'personal_growth'] },
            status: { type: 'string', enum: ['pending', 'in_progress', 'completed'] },
            total_thinking_minutes: { type: 'integer' },
            total_executing_minutes: { type: 'integer' },
            completed_at: { type: 'string', format: 'date-time', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Session: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            challenge_id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            category: { type: 'string', enum: ['health', 'career', 'relationships', 'personal_growth'] },
            session_type: { type: 'string', enum: ['thinking', 'executing'] },
            session_date: { type: 'string', format: 'date' },
            start_time: { type: 'string', nullable: true, example: '09:00' },
            end_time: { type: 'string', nullable: true, example: '10:30' },
            total_minutes: { type: 'integer', minimum: 1 },
            note: { type: 'string', maxLength: 100, nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        AuditLog: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            actor_user_id: { type: 'string', format: 'uuid', nullable: true },
            actor_role: { type: 'string', enum: ['user', 'admin'] },
            action: { type: 'string' },
            entity_type: { type: 'string' },
            entity_id: { type: 'string', format: 'uuid', nullable: true },
            metadata: { type: 'object', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/app/**/*.routes.js', './src/app/health/*.js'],
};

module.exports = swaggerJsdoc(options);
