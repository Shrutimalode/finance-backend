const FinancialRecord = require('../models/FinancialRecord');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Get dashboard summary (Totals, category-wise, trends, recent)
// @route   GET /api/dashboard/summary
// @access  Private (Admin, Analyst)
exports.getDashboardSummary = async (req, res, next) => {
  try {
    // 1. Calculate overall totals (totalIncome, totalExpense, netBalance)
    const totals = await FinancialRecord.aggregate([
      {
        $group: {
          _id: '$type', // Group by "income" or "expense"
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    totals.forEach(t => {
      if (t._id === 'income') totalIncome = t.totalAmount;
      if (t._id === 'expense') totalExpense = t.totalAmount;
    });

    const netBalance = totalIncome - totalExpense;

    // 2. Category-wise totals
    const categoryWiseTotals = await FinancialRecord.aggregate([
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          type: '$_id.type',
          category: '$_id.category',
          totalAmount: 1
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // 3. Monthly trends (income vs expense per month)
    const monthlyTrendsData = await FinancialRecord.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format the monthly trends for easier client-side consumption
    const formattedTrends = {};
    monthlyTrendsData.forEach(trend => {
      // Create a key structured like "2023-01", "2023-11"
      const monthKey = `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`;
      
      if (!formattedTrends[monthKey]) {
        formattedTrends[monthKey] = { month: monthKey, income: 0, expense: 0 };
      }
      
      if (trend._id.type === 'income') {
        formattedTrends[monthKey].income = trend.totalAmount;
      }
      if (trend._id.type === 'expense') {
        formattedTrends[monthKey].expense = trend.totalAmount;
      }
    });

    // 4. Recent transactions (last 5 records)
    const recentTransactions = await FinancialRecord.find()
      .sort({ date: -1 }) // Newest first
      .limit(5)
      .populate('userId', 'name email'); // Bring in the user who created it

    // Compile entire dashboard payload
    res.status(200).json({
      totalIncome,
      totalExpense,
      netBalance,
      categoryWiseTotals,
      monthlyTrends: Object.values(formattedTrends),
      recentTransactions
    });

  } catch (error) {
    next(error);
  }
};
