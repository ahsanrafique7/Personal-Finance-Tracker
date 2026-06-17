const Transaction = require('../models/Transaction');

// @desc  Add a transaction
// @route POST /api/transactions
// @access Private
const addTransaction = async (req, res) => {
  try {
    const { type, category, amount, description, date } = req.body;

    if (!type || !category || !amount) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    // Check tier limits
    const txCount = await Transaction.countDocuments({ user: req.user._id });
    const tierLimits = { free: 20, premium: 200, enterprise: 999999 };
    const userLimit = tierLimits[req.user.tier] || 20;

    if (txCount >= userLimit) {
      return res.status(403).json({
        message: `Your account has reached the limit for the ${req.user.tier} plan (${userLimit} transactions). Please upgrade your tier in Profile settings To continue.`,
        limitReached: true
      });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      category,
      amount,
      description,
      date: date || new Date(),
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all transactions for user
// @route GET /api/transactions
// @access Private
const getTransactions = async (req, res) => {
  try {
    const { type, search, sortBy, order, startDate, endDate } = req.query;

    let filter = { user: req.user._id };

    if (type && type !== 'all') filter.type = type;

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortField = sortBy || 'date';

    const transactions = await Transaction.find(filter).sort({ [sortField]: sortOrder });
    const total = await Transaction.countDocuments(filter);

    res.set('X-Total-Count', total);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update a transaction
// @route PUT /api/transactions/:id
// @access Private
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete a transaction
// @route DELETE /api/transactions/:id
// @access Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await transaction.deleteOne();
    res.json({ message: 'Transaction removed', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get reports/summary data
// @route GET /api/transactions/reports
// @access Private
const getReports = async (req, res) => {
  try {
    const userId = req.user._id;

    // Monthly aggregation for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthly = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Category-wise expense breakdown
    const categoryBreakdown = await Transaction.aggregate([
      { $match: { user: userId, type: 'expense' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Overall summary
    const summary = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const totalIncome = summary.find((s) => s._id === 'income')?.total || 0;
    const totalExpense = summary.find((s) => s._id === 'expense')?.total || 0;

    // Get overall transaction count for usage tracking
    const totalTransactions = await Transaction.countDocuments({ user: userId });

    // Daily spending... (skipping for brevity but keeping logic)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailySpending = await Transaction.aggregate([
      { $match: { user: userId, type: 'expense', date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const balance = totalIncome - totalExpense;
    const savingsGoal = req.user.savingsGoal || 0;

    const achievements = [
      {
        id: 'first_step',
        title: 'First Step',
        description: 'Added your first transaction.',
        icon: '🏁',
        unlocked: totalTransactions >= 1
      },
      {
        id: 'super_saver',
        title: 'Super Saver',
        description: 'Saved more than Rs. 5,000 overall.',
        icon: '💰',
        unlocked: balance > 5000
      },
      {
        id: 'goal_crusher',
        title: 'Goal Crusher',
        description: 'Reached or exceeded your Savings Goal.',
        icon: '🎯',
        unlocked: savingsGoal > 0 && balance >= savingsGoal
      },
      {
        id: 'veteran_tracker',
        title: 'Veteran Tracker',
        description: 'Logged 50 or more transactions.',
        icon: '🎖️',
        unlocked: totalTransactions >= 50
      },
      {
        id: 'budget_master',
        title: 'Budget Master',
        description: 'Kept expenses below 50% of your income.',
        icon: '🛡️',
        unlocked: totalIncome >= 1000 && totalExpense < (totalIncome * 0.5)
      }
    ];

    res.json({
      monthly,
      categoryBreakdown,
      dailySpending,
      totalIncome,
      totalExpense,
      balance,
      tier: req.user.tier,
      totalTransactions,
      tierLimits: { free: 20, premium: 200, enterprise: 999999 },
      achievements
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getReports,
};
