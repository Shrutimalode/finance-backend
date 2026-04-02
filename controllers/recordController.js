const FinancialRecord = require('../models/FinancialRecord');
const mongoose = require('mongoose');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Create a new record
// @route   POST /api/records
// @access  Private (Admin)
exports.createRecord = async (req, res, next) => {
  try {
    const { amount, type, category, date, note } = req.body;
    
    if (amount === undefined || !type || !category) {
      return next(new ErrorResponse('Amount, type, and category are required', 400));
    }

    if (amount <= 0) {
      return next(new ErrorResponse('Amount must be a positive number', 400));
    }

    if (type !== 'income' && type !== 'expense') {
      return next(new ErrorResponse('Type must be either "income" or "expense"', 400));
    }

    const record = await FinancialRecord.create({
      userId: req.user.id,
      amount,
      type,
      category,
      date: date || Date.now(),
      note
    });

    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all records (with filtering support)
// @route   GET /api/records
// @access  Private (Admin, Analyst, Viewer)
exports.getRecords = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, search, page: pageQuery, limit: limitQuery } = req.query;
    
    // Pagination defaults
    const page = parseInt(pageQuery, 10) || 1;
    const limit = parseInt(limitQuery, 10) || 10;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // Filter by type
    if (type) {
      query.type = type;
    }
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    // Filter by search term
    if (search) {
      query.$or = [
        { category: { $regex: search, $options: 'i' } },
        { note: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await FinancialRecord.countDocuments(query);

    const records = await FinancialRecord.find(query)
      .populate('userId', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: records
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a record
// @route   PUT /api/records/:id
// @access  Private (Admin)
exports.updateRecord = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorResponse('Invalid record ID format', 400));
    }

    let record = await FinancialRecord.findById(id);
    if (!record) {
      return next(new ErrorResponse('Financial record not found', 404));
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return next(new ErrorResponse('No fields provided to update', 400));
    }

    if (req.body.amount !== undefined && req.body.amount <= 0) {
      return next(new ErrorResponse('Amount must be a positive number', 400));
    }
    
    if (req.body.type && req.body.type !== 'income' && req.body.type !== 'expense') {
      return next(new ErrorResponse('Type must be either "income" or "expense"', 400));
    }

    record = await FinancialRecord.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(record);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a record
// @route   DELETE /api/records/:id
// @access  Private (Admin)
exports.deleteRecord = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorResponse('Invalid record ID format', 400));
    }

    const record = await FinancialRecord.findById(id);
    if (!record) {
      return next(new ErrorResponse('Financial record not found', 404));
    }

    // Soft delete
    record.deletedAt = Date.now();
    await record.save();
    
    res.status(200).json({ message: 'Record deleted successfully', id });
  } catch (error) {
    next(error);
  }
};
