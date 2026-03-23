const env = require('../configs/env');

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      env.CORS_ORIGIN_USER_APP,
      env.CORS_ORIGIN_CMS,
    ];
    // Allow requests with no origin (curl, Postman, same-origin)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = corsOptions;
