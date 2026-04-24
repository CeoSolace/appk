const { validationResult } = require('express-validator');
const Team = require('../models/Team');

function makeSlug(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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

    const baseSlug = makeSlug(name);
    let slug = baseSlug;
    let count = 1;

    while (await Team.findOne({ slug })) {
      slug = `${baseSlug}-${count}`;
      count += 1;
    }

    await Team.create({
      name: name.trim(),
      slug,
      description: description?.trim() || '',
      creator: req.session.userId,
      tags: [],
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

exports.createScrim = async (req, res) => {
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
      return res.status(400).render('teams/show', {
        title: team.name,
        team,
        errors: errors.array(),
        old: req.body,
      });
    }

    // Scrim model is not added yet, so for now this route safely works.
    // Later you can save description, region, and schedule into a Scrim collection.

    return res.redirect(`/teams/${team.slug}`);
  } catch (err) {
    console.error('Create scrim error:', err);
    return res.redirect('/teams');
  }
};
