const ErrorResponse = require('../utils/ErrorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (!error.statusCode || error.statusCode >= 500) {
    console.error(err);
  }

  if (err.name === 'CastError') {
    const message = `Invalid resource ID format: ${err.value}`;
    error = new ErrorResponse(message, 400);
  }

  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }

  if (err.name === 'JsonWebTokenError') {
      const message = 'Not authorized to access this route';
      error = new ErrorResponse(message, 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error'
  });
};

module.exports = errorHandler;
