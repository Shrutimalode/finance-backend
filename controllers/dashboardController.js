const FinancialRecord = require('../models/FinancialRecord');
const ErrorResponse = require('../utils/ErrorResponse');

exports.getDashboardSummary = async (req, res, next) => {
  try {
    const totals = await FinancialRecord.aggregate([
      {
        $group: {
          _id: '$type',
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

    const formattedTrends = {};
    monthlyTrendsData.forEach(trend => {
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

    const recentTransactions = await FinancialRecord.find()
      .sort({ date: -1 })
      .limit(5)
      .populate('userId', 'name email');

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
