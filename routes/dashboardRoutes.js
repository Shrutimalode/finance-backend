const express = require('express');
const { getDashboardSummary } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply the protect middleware globally on this router
router.use(protect);

// @route   GET /api/dashboard/summary
// @desc    Dashboard overview
// @access  Admin, Analyst
router.get('/summary', authorize('admin', 'analyst'), getDashboardSummary);

module.exports = router;
