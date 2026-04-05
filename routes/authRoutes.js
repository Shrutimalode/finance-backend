const express = require('express');
const { register, login, getUserProfile } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/profile', protect, getUserProfile);

router.get('/admin-only', protect, authorize('admin'), (req, res) => {
  res.json({ message: 'Welcome Admin! You have exclusive access.' });
});

router.get('/analytics', protect, authorize('admin', 'analyst'), (req, res) => {
  res.json({ message: 'Viewing Analytics Data: [100, 250, 400]' });
});

router.get('/data', protect, authorize('admin', 'analyst', 'viewer'), (req, res) => {
  res.json({ message: 'General Data accessed successfully by Viewer/Analyst/Admin.' });
});

module.exports = router;
