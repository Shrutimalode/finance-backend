const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/ErrorResponse');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        id: decoded.id,
        role: decoded.role
      };

      next();
    } catch (error) {
      return next(new ErrorResponse('Not authorized, invalid token', 401));
    }
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized, no token provided', 401));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ErrorResponse(`User role '${req.user ? req.user.role : 'undefined'}' is not authorized to access this route`, 403));
    }
    next();
  };
};

module.exports = { protect, authorize };
