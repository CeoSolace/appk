const { validationResult } = require('express-validator');
const Team = require('../models/Team');
const ScrimPost = require('../models/ScrimPost');

function makeSlug(text) {
  const base = String(text || 'scrim')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${base}-${Date.now()}`;
}

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
      slug: makeSlug(name),
      description: description?.trim() || '',
      creator: req.session.userId,
      members: [req.session.userId],
    });

    return res.redirect('/dashboard/scrimlink');
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

exports.browseScrims = async (req, res, next) => {
  try {
    const scrims = await ScrimPost.find({ archived: false })
      .populate('team')
      .sort({ createdAt: -1 });

    return res.render('scrims/index', {
      title: 'Scrims',
      scrims,
      errors: [],
    });
  } catch (err) {
    return next(err);
  }
};

exports.createScrim = async (req, res, next) => {
  const errors = validationResult(req);

  try {
    const team = await Team.findById(req.params.teamId);

    if (!team) {
      return res.status(404).render('errors/404', {
        title: 'Team Not Found',
      });
    }

    if (String(team.creator) !== String(req.session.userId)) {
      return res.status(403).render('errors/403', {
        title: 'Forbidden',
      });
    }

    if (!errors.isEmpty()) {
      return res.status(400).redirect(`/teams/${team.slug}`);
    }

    const { description, region, schedule } = req.body;

    await ScrimPost.create({
      team: team._id,
      slug: makeSlug(`${team.name}-scrim`),
      description: description.trim(),
      region: region.trim(),
      schedule: schedule ? new Date(schedule) : null,
    });

    return res.redirect('/scrims');
  } catch (err) {
    return next(err);
  }
};
