import express, { Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { testConnection, initializeDatabase } from './db';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

/**
 * Swagger/OpenAPI Configuration
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FairGig Authentication & User Management API',
      version: '1.0.0',
      description:
        'Complete authentication and user management service for FairGig platform with support for Workers, Verifiers, and Advocate roles',
      contact: {
        name: 'FairGig API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}/`,
        description: 'Development server',
      },
      {
        url: '',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token. Include in Authorization header as: Bearer <token>',
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User signup, login, token refresh, and logout',
      },
      {
        name: 'Users',
        description: 'User profile management and Verifier approval (Advocate only)',
      },
    ],
  },
  apis: [
    './src/routes/*.ts', // Include all route files
    './src/controllers/*.ts', // Include all controller files with JSDoc comments
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Swagger UI endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { swaggerOptions: { tryItOutEnabled: true } }));

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'FairGig Authentication Service',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
    },
  });
});

// Error handling middleware for unmatched routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

/**
 * Start Server and Initialize Database
 */
const startServer = async () => {
  try {
    console.log('🔍 Testing database connection...');
    await testConnection();

    console.log('📊 Initializing database schema...');
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`✅ Server is running at http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();