const express = require('express');
const router = express.Router();
const {
  createPayment,
  getPayments,
  submitPaymentReference,
  verifyPayment,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createPayment);
router.get('/', protect, getPayments);
router.post('/:id/submit', protect, submitPaymentReference);
router.post('/:id/verify', verifyPayment);

module.exports = router;
