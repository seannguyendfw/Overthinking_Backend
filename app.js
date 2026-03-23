const express = require('express');
const app = express();

require('./src/inits/middlewares')(app);
require('./src/inits/routes')(app);

module.exports = app;
