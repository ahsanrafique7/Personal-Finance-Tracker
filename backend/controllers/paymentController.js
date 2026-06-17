const Payment = require('../models/Payment');
const User = require('../models/User');

const PLAN_PRICES = {
  premium: 9,
  enterprise: 29,
};

const createPayment = async (req, res) => {
  try {
    const { plan } = req.body;

    if (!PLAN_PRICES[plan]) {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    const existingPayment = await Payment.findOne({
      user: req.user._id,
      plan,
      status: { $in: ['pending', 'submitted'] },
    }).sort({ createdAt: -1 });

    if (existingPayment) {
      return res.json(existingPayment);
    }

    const payment = await Payment.create({
      user: req.user._id,
      plan,
      amount: PLAN_PRICES[plan],
      status: 'pending',
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitPaymentReference = async (req, res) => {
  try {
    const { paymentReference } = req.body;

    if (!paymentReference || paymentReference.trim().length < 4) {
      return res.status(400).json({ message: 'Please enter a valid payment reference' });
    }

    const payment = await Payment.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: { $in: ['pending', 'submitted'] },
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.paymentReference = paymentReference.trim();
    payment.status = 'submitted';
    await payment.save();

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const verificationToken = process.env.PAYMENT_VERIFICATION_TOKEN;

    if (!verificationToken || req.headers['x-payment-token'] !== verificationToken) {
      return res.status(401).json({ message: 'Invalid payment verification token' });
    }

    const payment = await Payment.findById(req.params.id).populate('user');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    payment.status = 'paid';
    await payment.save();

    const user = await User.findById(payment.user);
    if (user && user.tier !== payment.plan) {
      user.tier = payment.plan;
      await user.save();
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPayment,
  getPayments,
  submitPaymentReference,
  verifyPayment,
  PLAN_PRICES,
};
