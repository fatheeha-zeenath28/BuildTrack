const Project = require('../models/Project');

exports.getProjects = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'engineer') query.engineers = req.user._id;
    if (req.user.role === 'client')   query.clients   = req.user._id;
    const projects = await Project.find(query)
      .populate('admin', 'name email')
      .populate('engineers', 'name email')
      .populate('clients', 'name email')
      .sort('-createdAt');
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('admin engineers clients', 'name email role');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, admin: req.user._id });
    res.status(201).json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total     = await Project.countDocuments();
    const active    = await Project.countDocuments({ status: 'active' });
    const completed = await Project.countDocuments({ status: 'completed' });
    const planning  = await Project.countDocuments({ status: 'planning' });
    const avgProg   = await Project.aggregate([{ $group: { _id: null, avg: { $avg: '$progress' } } }]);
    res.json({ total, active, completed, planning, avgProgress: Math.round(avgProg[0]?.avg || 0) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
