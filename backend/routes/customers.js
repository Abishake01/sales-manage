const express = require('express');
const router = express.Router();
const { getDb } = require('../database/db');
const { authenticateToken } = require('./auth');

// Get all customers for the authenticated user
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  const userId = req.user.id;

  db.all(
    'SELECT * FROM customers WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, customers) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(customers);
    }
  );
});

// Create or update customer
router.post('/', authenticateToken, (req, res) => {
  const db = getDb();
  const userId = req.user.id;
  const { id, name, address } = req.body;

  const customerId = id || `customer_${Date.now()}`;

  db.run(
    'INSERT OR REPLACE INTO customers (id, user_id, name, address, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
    [customerId, userId, name, address || ''],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error saving customer' });
      }
      res.json({ success: true, id: customerId });
    }
  );
});

module.exports = router;

