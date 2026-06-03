'use strict';

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, '../database/data.json');

function readDB() { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
function writeDB(data) { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }

const Product = {
  findAll(query = {}) {
    let list = readDB().products;
    const { category, search, minPrice, maxPrice, sort } = query;
    if (category && category !== 'all') list = list.filter(p => p.category === category);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (minPrice) list = list.filter(p => p.price >= Number(minPrice));
    if (maxPrice) list = list.filter(p => p.price <= Number(maxPrice));
    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  },

  findById(id) {
    return readDB().products.find(p => p.id === id) || null;
  },

  findFeatured() {
    return readDB().products.filter(p => p.featured);
  },

  create(data) {
    const db = readDB();
    const product = {
      id: uuidv4(),
      name: data.name.trim(),
      category: data.category,
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : Number(data.price),
      description: data.description.trim(),
      image: data.image || 'https://via.placeholder.com/600x400?text=Product',
      stock: Number(data.stock) || 0,
      rating: 0,
      reviews: 0,
      featured: Boolean(data.featured),
      badge: data.badge || ''
    };
    db.products.push(product);
    writeDB(db);
    return product;
  },

  update(id, data) {
    const db = readDB();
    const idx = db.products.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Product not found');
    const allowed = ['name', 'category', 'price', 'originalPrice', 'description', 'image', 'stock', 'featured', 'badge'];
    allowed.forEach(k => { if (data[k] !== undefined) db.products[idx][k] = data[k]; });
    writeDB(db);
    return db.products[idx];
  },

  delete(id) {
    const db = readDB();
    const idx = db.products.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Product not found');
    db.products.splice(idx, 1);
    writeDB(db);
    return true;
  },

  getCategories() {
    const products = readDB().products;
    return [...new Set(products.map(p => p.category))];
  }
};

module.exports = Product;
