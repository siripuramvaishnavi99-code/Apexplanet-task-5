'use strict';

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, '../database/data.json');

function readDB() { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
function writeDB(data) { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }

const Order = {
  findAll() { return readDB().orders; },

  findById(id) { return readDB().orders.find(o => o.id === id) || null; },

  findByUser(userId) { return readDB().orders.filter(o => o.userId === userId); },

  create({ userId, items }) {
    const db = readDB();
    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const order = {
      id: uuidv4(),
      userId,
      items,
      total: Math.round(total * 100) / 100,
      status: 'processing',
      createdAt: new Date().toISOString()
    };
    db.orders.push(order);
    writeDB(db);
    return order;
  },

  updateStatus(id, status) {
    const db = readDB();
    const idx = db.orders.findIndex(o => o.id === id);
    if (idx === -1) throw new Error('Order not found');
    db.orders[idx].status = status;
    writeDB(db);
    return db.orders[idx];
  },

  delete(id) {
    const db = readDB();
    const idx = db.orders.findIndex(o => o.id === id);
    if (idx === -1) throw new Error('Order not found');
    db.orders.splice(idx, 1);
    writeDB(db);
    return true;
  }
};

module.exports = Order;
