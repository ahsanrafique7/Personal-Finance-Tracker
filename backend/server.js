// const express = require('express');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const connectDB = require('./config/db');

// dotenv.config();

// // Connect to MongoDB
// connectDB();

// const app = express();

// // Middleware
// app.use(cors({ origin: true, credentials: true })); // origin: true allows all origins while keeping credentials
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// // Routes
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/transactions', require('./routes/transactionRoutes'));
// app.use('/api/payments', require('./routes/paymentRoutes'));

// // Health check
// app.get('/', (req, res) => {
//   res.json({ message: '✅ Personal Finance Tracker API is running' });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });



















const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Personal Finance Tracker API Running' });
});

module.exports = app;