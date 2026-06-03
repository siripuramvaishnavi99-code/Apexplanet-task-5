'use strict';

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ error: 'Authentication required. Please log in.' });
}

function requireGuest(req, res, next) {
  if (req.session && req.session.userId) {
    return res.status(400).json({ error: 'You are already logged in.' });
  }
  return next();
}

module.exports = { requireAuth, requireGuest };
