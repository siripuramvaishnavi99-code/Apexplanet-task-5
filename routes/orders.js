'use strict';

const router = require('express').Router();
const Order = require('../models/Order');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

router.get('/mine', requireAuth, (req, res) => {
  try {
    const orders = Order.findByUser(req.session.userId);
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.post('/', requireAuth, (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    const order = Order.create({ userId: req.session.userId, items });
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', requireAdmin, (_req, res) => {
  try {
    res.json({ orders: Order.findAll() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.put('/:id/status', requireAdmin, (req, res) => {
  try {
    const valid = ['processing', 'shipped', 'delivered', 'cancelled'];
    if (!valid.includes(req.body.status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const order = Order.updateStatus(req.params.id, req.body.status);
    res.json({ message: 'Status updated', order });
  } catch (err) {
    res.status(err.message === 'Order not found' ? 404 : 400).json({ error: err.message });
  }
});

module.exports = router;
