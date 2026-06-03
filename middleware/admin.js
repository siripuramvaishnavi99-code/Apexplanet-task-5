'use strict';

const User = require('../models/User');

async function requireAdmin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  const user = User.findById(req.session.userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  req.user = user;
  return next();
}

module.exports = { requireAdmin };
