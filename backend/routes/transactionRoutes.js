const express = require('express');
const router = express.Router();
const {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getReports,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/reports', protect, getReports);
router.route('/').get(protect, getTransactions).post(protect, addTransaction);
router.route('/:id').put(protect, updateTransaction).delete(protect, deleteTransaction);

module.exports = router;
