const Project = require('../models/Project');

exports.dashboard = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.session.userId });

    res.render('dashboard/devproof/index', {
      title: 'DevProof',
      projects: projects || [],
      error: null,
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    console.error(err);

    res.render('dashboard/devproof/index', {
      title: 'DevProof',
      projects: [],
      error: 'Failed to load projects',
      csrfToken: req.csrfToken(),
    });
  }
};
