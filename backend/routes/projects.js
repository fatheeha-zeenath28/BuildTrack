const express = require('express');
const router  = express.Router();
const { getProjects, getProject, createProject, updateProject, deleteProject, getStats } = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');
const { validateProject } = require('../middleware/validate');
const { requireAssignedEngineer } = require('../middleware/resourceAuth');

router.use(protect);
router.get('/stats',   authorize('admin'), getStats);
router.get('/',        getProjects);
router.get('/:id',     getProject);
router.post('/',       authorize('admin'), validateProject, createProject);
router.put('/:id',     authorize('admin', 'engineer'), requireAssignedEngineer, validateProject, updateProject);
router.delete('/:id',  authorize('admin'), deleteProject);

module.exports = router;
