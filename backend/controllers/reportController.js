const Report = require('../models/Report');

exports.getReports = async (req, res) => {
  try {
    const filter = req.query.project ? { project: req.query.project } : {};
    const reports = await Report.find(filter)
      .populate('author', 'name role')
      .populate('project', 'title')
      .sort('-reportDate');
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createReport = async (req, res) => {
  try {
    const report = await Report.create({ ...req.body, author: req.user._id });
    res.status(201).json({ report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
