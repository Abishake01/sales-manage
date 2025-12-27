const express = require('express');
const router = express.Router();
const { getDb } = require('../database/db');
const { authenticateToken } = require('./auth');

// Get all enquiries for the authenticated user
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  const userId = req.user.id;

  db.all(
    `SELECT e.*, 
            s.name as seller_name, s.address as seller_address,
            c.name as customer_name, c.address as customer_address
     FROM enquiries e
     LEFT JOIN sellers s ON e.seller_id = s.id
     LEFT JOIN customers c ON e.customer_id = c.id
     WHERE e.user_id = ?
     ORDER BY e.created_at DESC`,
    [userId],
    (err, enquiries) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Get items for each enquiry
      const enquiryPromises = enquiries.map((enquiry) => {
        return new Promise((resolve, reject) => {
          db.all(
            'SELECT * FROM enquiry_items WHERE enquiry_id = ?',
            [enquiry.id],
            (err, items) => {
              if (err) {
                reject(err);
              } else {
                enquiry.items = items;
                enquiry.seller = {
                  name: enquiry.seller_name,
                  address: enquiry.seller_address,
                };
                enquiry.customer = {
                  name: enquiry.customer_name,
                  address: enquiry.customer_address,
                };
                delete enquiry.seller_name;
                delete enquiry.seller_address;
                delete enquiry.customer_name;
                delete enquiry.customer_address;
                resolve(enquiry);
              }
            }
          );
        });
      });

      Promise.all(enquiryPromises)
        .then((enquiriesWithItems) => {
          res.json(enquiriesWithItems);
        })
        .catch((error) => {
          res.status(500).json({ error: 'Error fetching enquiry items' });
        });
    }
  );
});

// Get a single enquiry
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const userId = req.user.id;
  const enquiryId = req.params.id;

  db.get(
    `SELECT e.*, 
            s.name as seller_name, s.address as seller_address,
            c.name as customer_name, c.address as customer_address
     FROM enquiries e
     LEFT JOIN sellers s ON e.seller_id = s.id
     LEFT JOIN customers c ON e.customer_id = c.id
     WHERE e.id = ? AND e.user_id = ?`,
    [enquiryId, userId],
    (err, enquiry) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!enquiry) {
        return res.status(404).json({ error: 'Enquiry not found' });
      }

      db.all(
        'SELECT * FROM enquiry_items WHERE enquiry_id = ?',
        [enquiryId],
        (err, items) => {
          if (err) {
            return res.status(500).json({ error: 'Error fetching enquiry items' });
          }

          enquiry.items = items;
          enquiry.seller = {
            name: enquiry.seller_name,
            address: enquiry.seller_address,
          };
          enquiry.customer = {
            name: enquiry.customer_name,
            address: enquiry.customer_address,
          };
          delete enquiry.seller_name;
          delete enquiry.seller_address;
          delete enquiry.customer_name;
          delete enquiry.customer_address;

          res.json(enquiry);
        }
      );
    }
  );
});

// Create or update enquiry
router.post('/', authenticateToken, (req, res) => {
  const db = getDb();
  const userId = req.user.id;
  const {
    id,
    engagementNumber,
    enquiryNumber,
    date,
    status,
    seller,
    customer,
    items,
    totalAmount,
  } = req.body;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Save or get seller
    let sellerId = null;
    if (seller && seller.name) {
      sellerId = `seller_${Date.now()}`;
      db.run(
        'INSERT OR REPLACE INTO sellers (id, user_id, name, address, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [sellerId, userId, seller.name, seller.address || '']
      );
    }

    // Save or get customer
    let customerId = null;
    if (customer && customer.name) {
      customerId = `customer_${Date.now()}`;
      db.run(
        'INSERT OR REPLACE INTO customers (id, user_id, name, address, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [customerId, userId, customer.name, customer.address || '']
      );
    }

    // Save enquiry
    const enquiryId = id || `enquiry_${Date.now()}`;
    db.run(
      `INSERT OR REPLACE INTO enquiries 
       (id, user_id, engagement_number, enquiry_number, date, status, seller_id, customer_id, total_amount, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        enquiryId,
        userId,
        engagementNumber || null,
        enquiryNumber || null,
        date || null,
        status || 'pending',
        sellerId,
        customerId,
        totalAmount || 0,
      ],
      function (err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Error saving enquiry' });
        }

        // Delete existing items
        db.run('DELETE FROM enquiry_items WHERE enquiry_id = ?', [enquiryId], (err) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Error deleting old items' });
          }

          // Insert new items
          if (items && items.length > 0) {
            const itemPromises = items.map((item) => {
              return new Promise((resolve, reject) => {
                const itemId = `item_${Date.now()}_${Math.random()}`;
                const quantity = parseFloat(item.quantity) || 0;
                const unitPrice = parseFloat(item.unitPrice) || 0;
                const total = quantity * unitPrice;

                db.run(
                  `INSERT INTO enquiry_items 
                   (id, enquiry_id, description, part_number, made, quantity, unit_price, sale_price, sub_name, uom, total)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  [
                    itemId,
                    enquiryId,
                    item.description || '',
                    item.partNumber || '',
                    item.made || '',
                    quantity,
                    unitPrice,
                    parseFloat(item.salePrice) || 0,
                    item.subName || '',
                    item.uom || '',
                    total,
                  ],
                  (err) => {
                    if (err) reject(err);
                    else resolve();
                  }
                );
              });
            });

            Promise.all(itemPromises)
              .then(() => {
                db.run('COMMIT');
                res.json({ success: true, id: enquiryId });
              })
              .catch((err) => {
                db.run('ROLLBACK');
                res.status(500).json({ error: 'Error saving enquiry items' });
              });
          } else {
            db.run('COMMIT');
            res.json({ success: true, id: enquiryId });
          }
        });
      }
    );
  });
});

// Delete enquiry
router.delete('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const userId = req.user.id;
  const enquiryId = req.params.id;

  db.run(
    'DELETE FROM enquiries WHERE id = ? AND user_id = ?',
    [enquiryId, userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Enquiry not found' });
      }

      res.json({ success: true });
    }
  );
});

module.exports = router;

