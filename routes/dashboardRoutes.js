const express = require('express');
const { getDashboardSummary } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/summary', authorize('admin', 'analyst'), getDashboardSummary);

module.exports = router;
