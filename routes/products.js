'use strict';

const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { requireAdmin } = require('../middleware/admin');

const validate = validations => async (req, res, next) => {
  await Promise.all(validations.map(v => v.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
};

router.get('/', (req, res) => {
  try {
    const products = Product.findAll(req.query);
    res.json({ products, total: products.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/featured', (_req, res) => {
  try {
    res.json({ products: Product.findFeatured() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

router.get('/categories', (_req, res) => {
  try {
    res.json({ categories: Product.getCategories() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/:id', (req, res) => {
  const product = Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product });
});

router.post('/', requireAdmin, validate([
  body('name').trim().notEmpty().withMessage('Name required'),
  body('category').notEmpty().withMessage('Category required'),
  body('price').isFloat({ min: 0.01 }).withMessage('Valid price required'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('stock').isInt({ min: 0 }).withMessage('Valid stock required')
]), (req, res) => {
  try {
    const product = Product.create(req.body);
    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', requireAdmin, (req, res) => {
  try {
    const product = Product.update(req.params.id, req.body);
    res.json({ message: 'Product updated', product });
  } catch (err) {
    res.status(err.message === 'Product not found' ? 404 : 400).json({ error: err.message });
  }
});

router.delete('/:id', requireAdmin, (req, res) => {
  try {
    Product.delete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(err.message === 'Product not found' ? 404 : 400).json({ error: err.message });
  }
});

module.exports = router;
