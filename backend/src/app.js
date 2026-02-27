require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const authRoutes = require('./routes/auth.routes');

const app = express();
const apiPrefix = process.env.API_PREFIX || '/api/v1';

fs.mkdirSync(path.join(process.cwd(), 'logs'), { recursive: true });

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(ipFingerprintMiddleware);

app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip_fingerprint: req.ipFingerprint || null,
    ip_subnet: req.clientContext?.ipSubnet || null,
    ip_source: req.clientContext?.source || null,
  });
  next();
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'anonymous-reporting-api',
    timestamp: new Date().toISOString(),
  });
});

app.use(`${apiPrefix}/auth`, authRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
