const User = require('../models/User');
const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/ErrorResponse');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, status } = req.body;

    if (!name || !email || !password) {
      return next(new ErrorResponse('Name, email, and password are required', 400));
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ErrorResponse('User already exists', 400));
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'viewer',
      status: status || 'active'
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        token: generateToken(user._id, user.role),
      });
    } else {
      return next(new ErrorResponse('Invalid user data', 400));
    }
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorResponse('Email and password are required', 400));
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        token: generateToken(user._id, user.role),
      });
    } else {
      return next(new ErrorResponse('Invalid email or password', 401));
    }
  } catch (error) {
    next(error);
  }
};

// Example of a Protected Route controller
exports.getUserProfile = async (req, res, next) => {
  try {
    // `req.user` is populated by the authMiddleware
    res.status(200).json({
      message: 'You have accessed a private route!',
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};
