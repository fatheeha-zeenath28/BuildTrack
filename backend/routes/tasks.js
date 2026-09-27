const express = require('express');
const router  = express.Router();
const { getTasks, getTask, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');
const { validateTask } = require('../middleware/validate');

router.use(protect);
router.get('/',       getTasks);
router.get('/:id',    getTask);
router.post('/',      authorize('admin','engineer'), validateTask, createTask);
router.put('/:id',    authorize('admin','engineer'), validateTask, updateTask);
router.delete('/:id', authorize('admin'), deleteTask);

module.exports = router;
