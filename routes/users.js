'use strict';

const router = require('express').Router();
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

router.get('/me', requireAuth, (req, res) => {
  const user = User.findById(req.session.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

router.put('/me', requireAuth, (req, res) => {
  try {
    const user = User.update(req.session.userId, req.body);
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', requireAdmin, (_req, res) => {
  try {
    res.json({ users: User.findAll() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.delete('/:id', requireAdmin, (req, res) => {
  try {
    if (req.params.id === req.session.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    User.delete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(err.message === 'User not found' ? 404 : 400).json({ error: err.message });
  }
});

module.exports = router;
