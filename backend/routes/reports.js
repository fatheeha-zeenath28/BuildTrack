const express = require('express');
const router  = express.Router();
const { getReports, createReport, deleteReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');
const { validateReport } = require('../middleware/validate');

router.use(protect);
router.get('/',       getReports);
router.post('/',      authorize('admin','engineer'), validateReport, createReport);
router.delete('/:id', authorize('admin'), deleteReport);

module.exports = router;
