const Project = require('../models/Project');

// `authorize('admin','engineer')` only checks the user's ROLE — it can't
// know that "engineer" actually means "this specific engineer, on this
// specific project". Without this check, ANY engineer could PUT
// /api/projects/:id for a project they were never assigned to.
//
// This middleware adds that missing resource-level check:
//   - admins can update any project (unchanged behaviour)
//   - engineers may only update a project they are listed in `engineers`
//   - anyone else falls through to authorize(), which already blocks them
//
// It must run AFTER protect/authorize and BEFORE the controller, and
// needs :id in the route params (i.e. it belongs on PUT/DELETE /:id).
exports.requireAssignedEngineer = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') return next();

    const project = await Project.findById(req.params.id).select('engineers');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isAssigned = project.engineers.some((engId) => engId.equals(req.user._id));
    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this project' });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
