const Team = require('../models/Team');

exports.viewTeams = async (req, res, next) => {
  try {
    const teams = await Team.find().sort({ createdAt: -1 });

    res.render('teams/index', {
      title: 'Teams',
      teams,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
};

exports.viewTeam = async (req, res, next) => {
  try {
    const team = await Team.findOne({ slug: req.params.slug });

    if (!team) {
      return res.status(404).render('errors/404', {
        title: 'Team Not Found',
      });
    }

    res.render('teams/show', {
      title: team.name,
      team,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
};
