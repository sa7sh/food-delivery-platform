import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import compression from 'compression';
import http from 'http';
import rateLimit from 'express-rate-limit';

const app = express();

app.use(compression());
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many auth attempts, please try again later' },
});

// Apply strict limiters to auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/send-otp', authLimiter);

// Apply general limiter to all other requests
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ service: 'api-gateway', status: 'running' });
});

// Keep-alive Agent
const agent = new http.Agent({ keepAlive: true });

// Route: Auth Service
app.use(createProxyMiddleware({
  target: 'http://localhost:5001',
  changeOrigin: true,
  pathFilter: '/api/auth',
  agent,
}));

// Route: Restaurant + Food + Review Service
app.use(createProxyMiddleware({
  target: 'http://localhost:5002',
  changeOrigin: true,
  pathFilter: ['/api/restaurant', '/api/foods', '/api/reviews'],
  agent,
}));

// Route: Order Service
app.use(createProxyMiddleware({
  target: 'http://localhost:5003',
  changeOrigin: true,
  pathFilter: '/api/orders',
  ws: true,
  agent,
}));

// Route: Delivery Service
app.use(createProxyMiddleware({
  target: 'http://localhost:5004',
  changeOrigin: true,
  pathFilter: '/api/delivery',
  agent,
}));

app.listen(5000, () => {
  console.log('API Gateway running on port 5000');
});