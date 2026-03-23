module.exports = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,

  // Access token (short-lived, returned in response body)
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'changeme-access-secret',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',

  // Refresh token (long-lived, stored in HTTP-only cookie)
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'changeme-refresh-secret',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  CORS_ORIGIN_USER_APP: process.env.CORS_ORIGIN_USER_APP || 'http://localhost:3000',
  CORS_ORIGIN_CMS: process.env.CORS_ORIGIN_CMS || 'http://localhost:3001',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

  // SMTP — Forgot Password email
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'Overthinker App <noreply@example.com>',
};
