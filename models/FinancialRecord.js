const mongoose = require('mongoose');

const financialRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'User ID is required'],
    ref: 'User'
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be a positive number']
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: {
      values: ['income', 'expense'],
      message: '{VALUE} is not a valid type. It must be either "income" or "expense"'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    trim: true
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true 
});

function softDeleteFilter() {
  this.where({ deletedAt: null });
}
financialRecordSchema.pre('find', softDeleteFilter);
financialRecordSchema.pre('findOne', softDeleteFilter);
financialRecordSchema.pre('findOneAndUpdate', softDeleteFilter);
financialRecordSchema.pre('countDocuments', softDeleteFilter);
financialRecordSchema.pre('aggregate', function() {
  this.pipeline().unshift({ $match: { deletedAt: null } });
});

module.exports = mongoose.model('FinancialRecord', financialRecordSchema);
