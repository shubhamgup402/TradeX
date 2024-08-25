const express = require('express');
const router = express.Router();
const pool = require('../db/config');
const authMiddleware = require('../middleware/authMiddleware');

// Function to calculate the start date based on the time period
const getStartDate = (period) => {
    const now = new Date();
    switch (period) {
        case '1d':
            now.setDate(now.getDate() - 1);
            break;
        case '1m':
            now.setMonth(now.getMonth() - 1);
            break;
        case '3m':
            now.setMonth(now.getMonth() - 3);
            break;
        case '6m':
            now.setMonth(now.getMonth() - 6);
            break;
        case '1y':
            now.setFullYear(now.getFullYear() - 1);
            break;
        case 'max':
        default:
            // No change needed for 'max', return very old date to get all data
            now.setFullYear(1970); 
            break;
    }
    return now.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
};

// Route to fetch profit and loss data
router.get('/reports', authMiddleware, async (req, res) => {
    const userId = req.session.userId;
    const period = req.query.period || 'max'; // default to 'max' if no period is provided
    const startDate = getStartDate(period);

    if (!userId) {
        return res.status(403).send('Not authorized');
    }

    try {
        // Fetch aggregated profit and loss data by stock symbol for the user within the specified time period
        const result = await pool.query(
            `SELECT stock_symbol, stock_name, 
                    SUM(profit_loss)::numeric as total_profit_loss 
             FROM profits_losses 
             WHERE user_id = $1 AND pl_date >= $2 
             GROUP BY stock_symbol, stock_name 
             ORDER BY stock_symbol ASC`,
            [userId, startDate]
        );

        const pandlData = result.rows;

        // Calculate total profit and profit percentage for the period
        const totalProfit = pandlData.reduce((acc, entry) => acc + parseFloat(entry.total_profit_loss), 0);
        const totalProfitPercentage = (totalProfit / 10000) * 100; // Assuming initial investment was 10000, adjust as needed

        // Render the P&L data on the reports.ejs page
        res.render('reports', { pandlData, period, totalProfit, totalProfitPercentage });
    } catch (err) {
        console.error('Error fetching profit and loss data:', err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
