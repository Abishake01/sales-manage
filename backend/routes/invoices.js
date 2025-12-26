const express = require('express');
const router = express.Router();
const { getDb } = require('../database/db');
const { authenticateToken } = require('./auth');

// Get all invoices for the authenticated user
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  const userId = req.user.id;

  db.all(
    `SELECT i.*, 
            s.name as seller_name, s.address as seller_address,
            c.name as customer_name, c.address as customer_address
     FROM invoices i
     LEFT JOIN sellers s ON i.seller_id = s.id
     LEFT JOIN customers c ON i.customer_id = c.id
     WHERE i.user_id = ?
     ORDER BY i.created_at DESC`,
    [userId],
    (err, invoices) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Get items for each invoice
      const invoicePromises = invoices.map((invoice) => {
        return new Promise((resolve, reject) => {
          db.all(
            'SELECT * FROM invoice_items WHERE invoice_id = ?',
            [invoice.id],
            (err, items) => {
              if (err) {
                reject(err);
              } else {
                invoice.items = items;
                invoice.seller = {
                  name: invoice.seller_name,
                  address: invoice.seller_address,
                };
                invoice.customer = {
                  name: invoice.customer_name,
                  address: invoice.customer_address,
                };
                delete invoice.seller_name;
                delete invoice.seller_address;
                delete invoice.customer_name;
                delete invoice.customer_address;
                resolve(invoice);
              }
            }
          );
        });
      });

      Promise.all(invoicePromises)
        .then((invoicesWithItems) => {
          res.json(invoicesWithItems);
        })
        .catch((error) => {
          res.status(500).json({ error: 'Error fetching invoice items' });
        });
    }
  );
});

// Get a single invoice
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const userId = req.user.id;
  const invoiceId = req.params.id;

  db.get(
    `SELECT i.*, 
            s.name as seller_name, s.address as seller_address,
            c.name as customer_name, c.address as customer_address
     FROM invoices i
     LEFT JOIN sellers s ON i.seller_id = s.id
     LEFT JOIN customers c ON i.customer_id = c.id
     WHERE i.id = ? AND i.user_id = ?`,
    [invoiceId, userId],
    (err, invoice) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      db.all(
        'SELECT * FROM invoice_items WHERE invoice_id = ?',
        [invoiceId],
        (err, items) => {
          if (err) {
            return res.status(500).json({ error: 'Error fetching invoice items' });
          }

          invoice.items = items;
          invoice.seller = {
            name: invoice.seller_name,
            address: invoice.seller_address,
          };
          invoice.customer = {
            name: invoice.customer_name,
            address: invoice.customer_address,
          };
          delete invoice.seller_name;
          delete invoice.seller_address;
          delete invoice.customer_name;
          delete invoice.customer_address;

          res.json(invoice);
        }
      );
    }
  );
});

// Create or update invoice
router.post('/', authenticateToken, (req, res) => {
  const db = getDb();
  const userId = req.user.id;
  const {
    id,
    engagementNumber,
    invoiceNumber,
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

    // Save invoice
    const invoiceId = id || `invoice_${Date.now()}`;
    db.run(
      `INSERT OR REPLACE INTO invoices 
       (id, user_id, engagement_number, invoice_number, date, status, seller_id, customer_id, total_amount, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        invoiceId,
        userId,
        engagementNumber || null,
        invoiceNumber || null,
        date || null,
        status || 'pending',
        sellerId,
        customerId,
        totalAmount || 0,
      ],
      function (err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Error saving invoice' });
        }

        // Delete existing items
        db.run('DELETE FROM invoice_items WHERE invoice_id = ?', [invoiceId], (err) => {
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
                  `INSERT INTO invoice_items 
                   (id, invoice_id, description, part_number, made, quantity, unit_price, sale_price, sub_name, uom, total)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  [
                    itemId,
                    invoiceId,
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
                res.json({ success: true, id: invoiceId });
              })
              .catch((err) => {
                db.run('ROLLBACK');
                res.status(500).json({ error: 'Error saving invoice items' });
              });
          } else {
            db.run('COMMIT');
            res.json({ success: true, id: invoiceId });
          }
        });
      }
    );
  });
});

// Delete invoice
router.delete('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const userId = req.user.id;
  const invoiceId = req.params.id;

  db.run(
    'DELETE FROM invoices WHERE id = ? AND user_id = ?',
    [invoiceId, userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      res.json({ success: true });
    }
  );
});

module.exports = router;

