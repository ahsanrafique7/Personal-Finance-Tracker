const User = require('../models/User');
const Payment = require('../models/Payment');
const { PLAN_PRICES } = require('./paymentController');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc  Register a new user
// @route POST /api/auth/register
// @access Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({ name, email, password, tier: 'free' });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      tier: user.tier,
      savingsGoal: user.savingsGoal,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Login user
// @route POST /api/auth/login
// @access Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        tier: user.tier,
        savingsGoal: user.savingsGoal,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get user profile
// @route GET /api/auth/profile
// @access Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update user profile
// @route PUT /api/auth/profile
// @access Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.savingsGoal = req.body.savingsGoal !== undefined ? req.body.savingsGoal : user.savingsGoal;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      tier: updatedUser.tier,
      savingsGoal: updatedUser.savingsGoal,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update user tier
// @route PUT /api/auth/tier
// @access Private
const updateTier = async (req, res) => {
  try {
    const { tier } = req.body;
    if (!['free', 'premium', 'enterprise'].includes(tier)) {
      return res.status(400).json({ message: 'Invalid tier' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (tier === user.tier) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        tier: user.tier,
        savingsGoal: user.savingsGoal,
        token: generateToken(user._id),
      });
    }

    if (tier !== 'free' && !PLAN_PRICES[tier]) {
      return res.status(400).json({ message: 'Invalid paid tier' });
    }

    if (tier !== 'free') {
      const paidPayment = await Payment.findOne({
        user: user._id,
        plan: tier,
        status: 'paid',
      }).sort({ createdAt: -1 });

      if (!paidPayment) {
        return res.status(402).json({
          message: 'Payment required before activating this plan. Please complete payment first.',
          paymentRequired: true,
        });
      }
    }

    user.tier = tier;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      tier: user.tier,
      savingsGoal: user.savingsGoal,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getProfile, updateProfile, updateTier };
