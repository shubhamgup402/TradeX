//index.js 
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/order'); 
const holdingsRoutes = require('./routes/holdings');
const authMiddleware = require('./middleware/authMiddleware');
const pool = require('./db/config');
const app = express();
const PORT = process.env.PORT || 3001;

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
app.use('/', orderRoutes); // Use the order routes
app.use('/', holdingsRoutes); // Use the holdings routes

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', authMiddleware, async (req, res) => {
  const userId = req.session.userId;

  try {
    const result = await pool.query('SELECT balance FROM users WHERE user_id = $1', [userId]);
    if (result.rows.length > 0) {
      const balance = result.rows[0].balance;
      const username = req.session.username;
      console.log(`User balance: ${balance}`); // Print balance to console
      res.render('dashboard', { username, balance });
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    console.error(err);
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
    // Update the user's balance
    await pool.query(
      'UPDATE users SET balance = balance + $1 WHERE user_id = $2',
      [amount, userId]
    );
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
