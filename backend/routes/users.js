const express = require('express');
const router  = express.Router();
const { getUsers, getUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { validateUserUpdate } = require('../middleware/validate');

router.use(protect);
router.get('/',        authorize('admin'), getUsers);
router.get('/:id',     authorize('admin'), getUser);
router.put('/:id',     authorize('admin'), validateUserUpdate, updateUser);
router.delete('/:id',  authorize('admin'), deleteUser);

module.exports = router;
