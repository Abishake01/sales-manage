const express = require('express');
const router = express.Router();
const { getDb } = require('../database/db');
const { authenticateToken } = require('./auth');

// Get all sellers for the authenticated user
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  const userId = req.user.id;

  db.all(
    'SELECT * FROM sellers WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, sellers) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(sellers);
    }
  );
});

// Create or update seller
router.post('/', authenticateToken, (req, res) => {
  const db = getDb();
  const userId = req.user.id;
  const { id, name, address } = req.body;

  const sellerId = id || `seller_${Date.now()}`;

  db.run(
    'INSERT OR REPLACE INTO sellers (id, user_id, name, address, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
    [sellerId, userId, name, address || ''],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error saving seller' });
      }
      res.json({ success: true, id: sellerId });
    }
  );
});

module.exports = router;

