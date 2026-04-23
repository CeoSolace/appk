const User = require('../models/User');
const Report = require('../models/Report');

// Admin dashboard
exports.dashboard = async (req, res) => {
  try {
    const users = await User.find();
    const reports = await Report.find().sort({ createdAt: -1 });
    res.render('admin/index', { title: 'Admin Dashboard', users, reports });
  } catch (err) {
    console.error(err);
    res.status(500).render('admin/index', { title: 'Admin Dashboard', users: [], reports: [] });
  }
};

// Suspend or unsuspend a user
exports.toggleSuspend = async (req, res) => {
  const userId = req.params.userId;
  if (userId === req.session.userId) return res.redirect('/admin');
  try {
    const user = await User.findById(userId);
    if (!user) return res.redirect('/admin');
    user.isSuspended = !user.isSuspended;
    await user.save();
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.redirect('/admin');
  }
};

// Delete report
exports.deleteReport = async (req, res) => {
  const reportId = req.params.reportId;
  try {
    await Report.findByIdAndDelete(reportId);
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.redirect('/admin');
  }
};