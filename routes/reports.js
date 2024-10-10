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
            now.setFullYear(1970);
            break;
    }
    return now.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
};

// Route to fetch profit and loss data
router.get('/reports', authMiddleware, async (req, res) => {
    const userId = req.session.userId;
    // console.log('Fetching reports for User ID:', userId); // Debug log

    const period = req.query.period || 'max'; // Default to 'max' if no period is provided
    const customStartDate = req.query.startDate || null;
    const customEndDate = req.query.endDate || null;

    // If custom date range is provided, use that. Otherwise, calculate based on the period.
    const startDate = customStartDate || getStartDate(period);
    const endDate = customEndDate || new Date().toISOString().split('T')[0]; // Default to today's date

    // console.log(`Period: ${period}, Start Date: ${startDate}, End Date: ${endDate}`); // Debug log

    if (!userId) {
        // console.log('No user ID found in session.');
        return res.status(403).send('Not authorized');
    }

    try {
        // Fetch user email and name
        const userInfo = await pool.query(`SELECT username, email FROM users WHERE user_id = $1`, [userId]);
        const user = userInfo.rows[0];
        // console.log('User Info:', user); // Debug log

        if (!user) {
            console.log('User not found in the database.');
            return res.status(404).send('User not found');
        }

        // Fetch profit and loss data
        const result = await pool.query(
            `SELECT stock_symbol, stock_name, 
                    TO_CHAR(pl_date, 'YYYY-MM-DD') AS pl_date,  
                    SUM(profit_loss)::numeric as total_profit_loss,
                    SUM(invested)::numeric as total_invested
             FROM profits_losses 
             WHERE user_id = $1 AND pl_date BETWEEN $2 AND $3
             GROUP BY stock_symbol, stock_name, pl_date 
             ORDER BY stock_symbol ASC`,
            [userId, startDate, endDate]
        );
        const reportsData = result.rows;
        // console.log('Fetched Reports Data:', reportsData); // Debug log

        // Calculate total profit, total invested, and percentage return
        const totalProfit = reportsData.reduce((acc, entry) => acc + parseFloat(entry.total_profit_loss), 0);
        const totalInvested = reportsData.reduce((acc, entry) => acc + (parseFloat(entry.total_invested) || 0), 0);
        const totalProfitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

        // Render the reports page with data
        res.render('reports', { 
            reportsData, 
            period, 
            totalProfit, 
            totalProfitPercentage, 
            totalInvested, 
            customStartDate, 
            customEndDate,
            user // Pass the user's email and name to the template
        });
    } catch (err) {
        console.error('Error fetching profit and loss data:', err);
        res.status(500).send('Server error');
    }
});

// Additional route to handle downloading reports as CSV
router.get('/reports/download', authMiddleware, async (req, res) => {
    const userId = req.session.userId;
    // console.log('Downloading reports for User ID:', userId); // Debug log

    if (!userId) {
        return res.status(403).send('Not authorized');
    }

    try {
        const result = await pool.query(
            `SELECT stock_symbol, stock_name, 
                    TO_CHAR(pl_date, 'YYYY-MM-DD') AS pl_date,  
                    SUM(profit_loss)::numeric as total_profit_loss,
                    SUM(invested)::numeric as total_invested
             FROM profits_losses 
             WHERE user_id = $1
             GROUP BY stock_symbol, stock_name, pl_date 
             ORDER BY stock_symbol ASC`,
            [userId]
        );
        const reportsData = result.rows;
        // console.log('Reports Data for CSV:', reportsData); // Debug log

        // Generate CSV
        let csv = 'Stock Symbol,Stock Name,Date,Total Profit/Loss,Total Invested\n';
        reportsData.forEach(report => {
            csv += `${report.stock_symbol},${report.stock_name},${report.pl_date},${report.total_profit_loss},${report.total_invested}\n`;
        });

        // Set headers for download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=reports.csv');
        res.send(csv);
    } catch (err) {
        console.error('Error downloading reports:', err);
        res.status(500).send('Server error');
    }
});

// Route to fetch transactions based on stock symbol
router.get('/transactions', authMiddleware, async (req, res) => {
    const userId = req.session.userId;
    const stockSymbol = req.query.symbol;

    // console.log(`Fetching transactions for User ID: ${userId}, Stock Symbol: ${stockSymbol}`); // Debug log

    if (!userId || !stockSymbol) {
        return res.status(403).send('Not authorized');
    }

    try {
        const result = await pool.query(
            `SELECT transaction_date, quantity, limit_price 
             FROM transactions 
             WHERE user_id = $1 AND stock_symbol = $2 
             ORDER BY transaction_date ASC`,
            [userId, stockSymbol]
        );
        const transactions = result.rows;
        // console.log('Fetched Transactions:', transactions); // Debug log
        res.json(transactions);
    } catch (err) {
        console.error('Error fetching transactions:', err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
