import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import express from 'express';

const swaggerDocument = JSON.parse(fs.readFileSync(path.join(__dirname, 'swagger.json'), 'utf8'));

export const setupSwagger = (app: express.Express) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
