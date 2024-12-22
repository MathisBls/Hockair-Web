import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB', err));

  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'AirHockey API',
        version: '1.0.0',
        description: 'API documentation for the AirHockey application',
      },
      servers: [
        {
          url: `http://localhost:${PORT}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
        schemas: {
          Skin: {
            type: 'object',
            required: ['name', 'type', 'price', 'filePath'],
            properties: {
              name: {
                type: 'string',
                description: 'Name of the skin',
              },
              type: {
                type: 'string',
                enum: ['puck', 'mallet', 'table'],
                description: 'Type of the skin (e.g., puck, mallet, table)',
              },
              price: {
                type: 'number',
                description: 'Price of the skin',
              },
              premiumOnly: {
                type: 'boolean',
                description: 'Indicates if the skin is for premium users only',
              },
              filePath: {
                type: 'string',
                description: 'Path to the associated file for the skin',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'Date when the skin was created',
              },
            },
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    apis: ['./src/routes/*.js'],
  };


const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

import userRoutes from './routes/userRoutes.js';
import skinRoutes from './routes/skinRoutes.js';

app.use('/api/users', userRoutes);
app.use('/api/skins', skinRoutes);

app.get('/', (req, res) => {
  res.send('AirHockey API is running');
});

export default app;
