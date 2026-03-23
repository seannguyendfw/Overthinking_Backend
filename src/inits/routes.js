const errorMiddleware = require('../middlewares/error.middleware');

const healthRouter = require('../app/health/health.routes');
const authRouter = require('../app/auth/auth.routes');
const challengesRouter = require('../app/challenges/challenges.routes');
const sessionsRouter = require('../app/sessions/sessions.routes');
const dashboardRouter = require('../app/dashboard/dashboard.routes');
const adminRouter = require('../app/admin/admin.routes');

module.exports = (app) => {
  // Health check
  app.use('/health', healthRouter);

  // API v1
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/challenges', challengesRouter);
  app.use('/api/v1/sessions', sessionsRouter);
  app.use('/api/v1/dashboard', dashboardRouter);
  app.use('/api/v1/admin', adminRouter);

  // 404 catch-all
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` },
    });
  });

  // Global error handler (must be last)
  app.use(errorMiddleware);
};
