require('dotenv').config();
const app = require('./app');
const env = require('./src/configs/env');

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Overthinker API running on http://localhost:${PORT}`);
  console.log(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
  console.log(`🌿 Environment: ${env.NODE_ENV}`);
});
