'use strict';

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, '../database/data.json');

function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

const User = {
  findAll() {
    return readDB().users.map(u => { const { password, ...rest } = u; return rest; });
  },

  findById(id) {
    const u = readDB().users.find(u => u.id === id);
    if (!u) return null;
    const { password, ...rest } = u;
    return rest;
  },

  findByEmail(email) {
    return readDB().users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async create({ name, email, password }) {
    const db = readDB();
    if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already registered');
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = {
      id: uuidv4(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role: 'user',
      createdAt: new Date().toISOString(),
      avatar: name.trim()[0].toUpperCase()
    };
    db.users.push(user);
    writeDB(db);
    const { password: _p, ...safe } = user;
    return safe;
  },

  async verifyPassword(plainText, hash) {
    return bcrypt.compare(plainText, hash);
  },

  update(id, fields) {
    const db = readDB();
    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');
    const allowed = ['name', 'avatar'];
    allowed.forEach(k => { if (fields[k] !== undefined) db.users[idx][k] = fields[k]; });
    writeDB(db);
    const { password, ...rest } = db.users[idx];
    return rest;
  },

  delete(id) {
    const db = readDB();
    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');
    db.users.splice(idx, 1);
    writeDB(db);
    return true;
  }
};

module.exports = User;
