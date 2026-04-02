const express = require('express');
const { 
  createRecord, 
  getRecords, 
  updateRecord, 
  deleteRecord 
} = require('../controllers/recordController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply the protect middleware globally on this router
// You must be logged in to touch anything here!
router.use(protect);

router.route('/')
  .post(authorize('admin'), createRecord)
  .get(authorize('admin','analyst' , 'viewer'), getRecords);

router.route('/:id')
  .put(authorize('admin'), updateRecord)
  .delete(authorize('admin'), deleteRecord);

module.exports = router;
