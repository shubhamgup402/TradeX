// index.js
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require('express-session');
const axios = require('axios');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/order');
const { router: holdingsRoutes, updateHoldingsData, latestData } = require('./routes/holdings');
const transactionRoutes = require('./routes/transaction');
const authMiddleware = require('./middleware/authMiddleware');
const pool = require('./db/config');
const reportsRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');

app.use(session({
  secret: 'JKAEDWE9R47BZMSZNQAWE[3HGSQ8EQWEYQ',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use('/', authRoutes);
app.use('/', orderRoutes);
app.use('/', holdingsRoutes);
app.use('/', transactionRoutes);
app.use('/', reportsRoutes);

// Endpoint to fetch cryptocurrency prices
app.get('/crypto-prices', async (req, res) => {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/ticker/price');
    const prices = response.data;
    res.json(prices);
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    res.status(500).send('Server error');
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', authMiddleware, async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(403).send('Not authorized');
  }

  await updateHoldingsData(userId);

  const data = latestData[userId];
  const username = req.session.username;

  // Calculate remaining time for next fund addition
  const nowUTC = new Date(new Date().toUTCString());

  try {
    const result = await pool.query(
      'SELECT last_fund_date FROM users WHERE user_id = $1',
      [userId]
    );

    const lastFundDateStr = result.rows[0].last_fund_date;
    const lastFundDate = lastFundDateStr ? new Date(lastFundDateStr).toUTCString() : new Date(0).toUTCString();
    const lastFundDateUTC = new Date(lastFundDate);

    let remainingTimeText = "You can add funds now.";

    const oneMonthMillis = 30 * 24 * 60 * 60 * 1000; // Approximate one month in milliseconds
    const timeSinceLastFund = nowUTC.getTime() - lastFundDateUTC.getTime();

    if (timeSinceLastFund < oneMonthMillis) {
      const timeLeftMillis = oneMonthMillis - timeSinceLastFund;
      const days = Math.floor(timeLeftMillis / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeftMillis % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeftMillis % (1000 * 60 * 60)) / (1000 * 60));

      remainingTimeText = `You can add funds again in ${days} day(s), ${hours} hour(s), and ${minutes} minute(s).`;
    }

    res.render('dashboard', {
      username,
      balance: data.balance,
      totalInvested: data.totalInvested,
      totalCurrent: data.totalCurrent,
      totalReturn: data.totalReturn,
      totalReturnPercentage: data.totalReturnPercentage,
      remainingTimeText 
    });
  } catch (err) {
    console.error('Error fetching last fund date:', err);
    res.status(500).send('Server error');
  }
});

app.post('/add-funds', authMiddleware, async (req, res) => {
  const { amount } = req.body;  
  const userId = req.session.userId;  

  if (!userId) {
    return res.status(403).send('Not authorized'); 
  }

  try {
    const nowUTC = new Date(new Date().toUTCString());

    const oneMonthMillis = 30 * 24 * 60 * 60 * 1000;

    const result = await pool.query(
      'SELECT balance, last_fund_date FROM users WHERE user_id = $1',
      [userId]
    );

    const user = result.rows[0];
    const lastFundDate = user.last_fund_date ? new Date(user.last_fund_date).toUTCString() : new Date(0).toUTCString();

    // Calculate the time elapsed since the last fund addition
    const timeSinceLastFund = nowUTC.getTime() - new Date(lastFundDate).getTime();

    // Check if the time elapsed is less than the allowed one month period
    if (timeSinceLastFund < oneMonthMillis) {
      const timeLeftMillis = oneMonthMillis - timeSinceLastFund;
      const days = Math.floor(timeLeftMillis / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeftMillis % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeftMillis % (1000 * 60 * 60)) / (1000 * 60));

      const remainingTimeText = `You can add funds again in ${days} day(s), ${hours} hour(s), and ${minutes} minute(s).`;

      return res.status(403).render('dashboard', {
        username: req.session.username,
        balance: user.balance,
        totalInvested: data.totalInvested,
        totalCurrent: data.totalCurrent,
        totalReturn: data.totalReturn,
        totalReturnPercentage: data.totalReturnPercentage,
        remainingTimeText,  
        errorMessage: remainingTimeText 
      });
    }

    await pool.query(
      'UPDATE users SET balance = balance + $1, last_fund_date = $2 WHERE user_id = $3',
      [amount, nowUTC.toISOString(), userId]
    );

    await updateHoldingsData(userId);

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error updating funds:', err);
    res.status(500).send('Server error');  
  }
});


pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
  } else {
    console.log('Database connected:', res.rows[0]);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
