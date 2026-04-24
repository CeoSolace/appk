const { validationResult } = require('express-validator');
const Team = require('../models/Team');

exports.dashboard = async (req, res) => {
  try {
    const teams = await Team.find({ creator: req.session.userId }).sort({ createdAt: -1 });

    return res.render('dashboard/scrimlink/index', {
      title: 'ScrimLink',
      teams: teams || [],
      errors: [],
      old: {},
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    console.error('ScrimLink dashboard error:', err);

    return res.render('dashboard/scrimlink/index', {
      title: 'ScrimLink',
      teams: [],
      errors: [{ msg: 'Failed to load teams' }],
      old: {},
      csrfToken: req.csrfToken(),
    });
  }
};

exports.createTeam = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const teams = await Team.find({ creator: req.session.userId }).sort({ createdAt: -1 });

    return res.status(400).render('dashboard/scrimlink/index', {
      title: 'ScrimLink',
      teams,
      errors: errors.array(),
      old: req.body,
      csrfToken: req.csrfToken(),
    });
  }

  try {
    const { name, description } = req.body;

    await Team.create({
      name: name.trim(),
      description: description?.trim() || '',
      creator: req.session.userId,
      members: [req.session.userId],
    });

    return res.redirect('/scrimlink');
  } catch (err) {
    console.error('Create team error:', err);

    const teams = await Team.find({ creator: req.session.userId }).sort({ createdAt: -1 });

    return res.status(500).render('dashboard/scrimlink/index', {
      title: 'ScrimLink',
      teams,
      errors: [{ msg: 'Failed to create team' }],
      old: req.body,
      csrfToken: req.csrfToken(),
    });
  }
};
