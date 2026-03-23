const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../configs/swagger');
const corsOptions = require('../cors/cors.config');
const env = require('../configs/env');

module.exports = (app) => {
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Swagger UI
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'Overthinker API Docs',
      swaggerOptions: { persistAuthorization: true },
    })
  );

  // Raw swagger JSON for tooling
  app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));
};
