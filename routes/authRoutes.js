const express = require('express');
const { register, login, getUserProfile } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Private route protected by our middleware
router.get('/profile', protect, getUserProfile);

// --- EXAMPLE ROLE-BASED USAGE ---

// 1. Only admin can access certain routes
router.get('/admin-only', protect, authorize('admin'), (req, res) => {
  res.json({ message: 'Welcome Admin! You have exclusive access.' });
});

// 2. Analyst and admin can access analytics routes
router.get('/analytics', protect, authorize('admin', 'analyst'), (req, res) => {
  res.json({ message: 'Viewing Analytics Data: [100, 250, 400]' });
});

// 3. Viewer can only read data (Admin and Analyst can also read)
router.get('/data', protect, authorize('admin', 'analyst', 'viewer'), (req, res) => {
  res.json({ message: 'General Data accessed successfully by Viewer/Analyst/Admin.' });
});

module.exports = router;
