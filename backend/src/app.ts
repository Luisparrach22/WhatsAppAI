import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { errorHandler } from './middlewares/error-handler.js';

// Routers
import authRouter from './routes/auth.routes.js';
import tripsRouter from './routes/trips.routes.js';
import whatsappRouter from './routes/whatsapp.routes.js';

const app = express();

// Middlewares globales de seguridad e información
app.use(helmet());
app.use(cors({
  origin: '*', // En producción delimitar a los dominios del frontend
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json());

// Endpoints base
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: env.SUPABASE_SERVICE_ROLE_KEY === 'mock-service-role-key' ? 'mocked' : 'connected',
  });
});

// Rutas de módulos
app.use('/api/auth', authRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/webhooks/whatsapp', whatsappRouter);

// Manejador centralizado de errores (Debe ser el último middleware cargado)
app.use(errorHandler);

const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  console.log(`👉 Webhook verify endpoint: http://localhost:${PORT}/api/webhooks/whatsapp`);
});

export default app;
