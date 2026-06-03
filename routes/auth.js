'use strict';

const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { requireAuth, requireGuest } = require('../middleware/auth');

const validate = validations => async (req, res, next) => {
  await Promise.all(validations.map(v => v.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
};

router.post('/register', requireGuest, validate([
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number')
]), async (req, res) => {
  try {
    const user = await User.create(req.body);
    req.session.userId = user.id;
    req.session.role = user.role;
    res.status(201).json({ message: 'Account created successfully', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', requireGuest, validate([
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
]), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = User.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const ok = await User.verifyPassword(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    req.session.userId = user.id;
    req.session.role = user.role;
    const { password: _p, ...safe } = user;
    res.json({ message: 'Logged in successfully', user: safe });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

router.get('/me', requireAuth, (req, res) => {
  const user = User.findById(req.session.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

module.exports = router;
