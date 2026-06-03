'use strict';

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

/* ─── Security ─────────────────────────────────────────── */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://images.unsplash.com', 'https://via.placeholder.com'],
      connectSrc: ["'self'"]
    }
  }
}));

app.use(cors({ origin: true, credentials: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later.' }
});

/* ─── Middleware ────────────────────────────────────────── */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

/* ─── Static files ──────────────────────────────────────── */
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0
}));

/* ─── API Routes ────────────────────────────────────────── */
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

/* ─── View Routes ───────────────────────────────────────── */
const views = path.join(__dirname, 'views');
const pages = ['products', 'cart', 'login', 'register', 'dashboard', 'admin', 'contact', 'about'];
pages.forEach(page => {
  app.get(`/${page}`, (_req, res) => res.sendFile(path.join(views, `${page}.html`)));
  app.get(`/${page}.html`, (_req, res) => res.redirect(301, `/${page}`));
});
app.get('/product/:id', (_req, res) => res.sendFile(path.join(views, 'product.html')));
app.get('/', (_req, res) => res.sendFile(path.join(views, 'index.html')));

/* ─── 404 & Error ───────────────────────────────────────── */
app.use((_req, res) => res.status(404).sendFile(path.join(views, '404.html')));
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

/* ─── Start ─────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n  ApexStore running at http://localhost:${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
