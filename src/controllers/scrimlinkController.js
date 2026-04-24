const Team = require('../models/Team');

exports.dashboard = async (req, res) => {
  try {
    const teams = await Team.find({ creator: req.session.userId });

    res.render('dashboard/scrimlink/index', {
      title: 'ScrimLink',
      teams: teams || [],
      errors: [],
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    console.error(err);

    res.render('dashboard/scrimlink/index', {
      title: 'ScrimLink',
      teams: [],
      errors: [{ msg: 'Failed to load teams' }],
      csrfToken: req.csrfToken(),
    });
  }
};
