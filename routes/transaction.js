const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../db/config');

router.get('/transaction', authMiddleware, async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(403).send('Not authorized');
  }

  const { startDate, endDate, status, orderAction, orderType, cryptoName } = req.query;

  try {
    // Base query for transactions
    let transactionsQuery = 'SELECT * FROM transactions WHERE user_id = $1';
    let queryParams = [userId];
    let queryIndex = 2;

    // Append conditions based on filters
    if (startDate) {
      transactionsQuery += ` AND transaction_date >= $${queryIndex++}`;
      queryParams.push(startDate);
    }
    if (endDate) {
      transactionsQuery += ` AND transaction_date <= $${queryIndex++}`;
      queryParams.push(endDate);
    }
    if (status) {
      transactionsQuery += ` AND status = $${queryIndex++}`;
      queryParams.push(status);
    }
    if (orderAction) {
      transactionsQuery += ` AND order_action = $${queryIndex++}`;
      queryParams.push(orderAction);
    }
    if (orderType) {
      transactionsQuery += ` AND order_type = $${queryIndex++}`;
      queryParams.push(orderType);
    }
    if (cryptoName) {
      transactionsQuery += ` AND stock_name ILIKE $${queryIndex++}`; // Using ILIKE for case-insensitive matching
      queryParams.push(`%${cryptoName}%`); // Add wildcards for partial matching
    }

    // Execute filtered transactions query
    const transactionsResult = await pool.query(transactionsQuery, queryParams);

    // Query for pending orders (no filters needed)
    const pendingOrdersResult = await pool.query('SELECT * FROM pending_orders WHERE user_id = $1', [userId]);

    const transactions = transactionsResult.rows.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
    const pendingOrders = pendingOrdersResult.rows.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));

    res.render('transaction', { transactions, pendingOrders, startDate, endDate, status, orderAction, orderType, cryptoName }); // Pass all relevant parameters
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.delete('/cancel-order/:id', authMiddleware, async (req, res) => {
  const userId = req.session.userId;
  const orderId = req.params.id;

  if (!userId) {
    return res.status(403).send('Not authorized');
  }

  try {
    await pool.query('DELETE FROM pending_orders WHERE order_id = $1 AND user_id = $2', [orderId, userId]);
    res.send('Order canceled successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
