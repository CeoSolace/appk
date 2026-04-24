const Team = require('../models/Team');
const ScrimPost = require('../models/ScrimPost');
const User = require('../models/User');

exports.viewTeams = async (req, res, next) => {
  try {
    const teams = await Team.find().sort({ createdAt: -1 });

    return res.render('teams/index', {
      title: 'Teams',
      teams,
      errors: [],
    });
  } catch (err) {
    return next(err);
  }
};

exports.viewTeam = async (req, res, next) => {
  try {
    const team = await Team.findOne({ slug: req.params.slug }).lean();

    if (!team) {
      return res.status(404).render('errors/404', {
        title: 'Team Not Found',
      });
    }

    const scrims = await ScrimPost.find({
      team: team._id,
      archived: false,
    })
      .sort({ createdAt: -1 })
      .lean();

    let members = [];

    if (team.members && team.members.length) {
      const users = await User.find({
        _id: { $in: team.members },
      })
        .select('username')
        .lean();

      members = users.map((user) => ({
        user,
        role: String(user._id) === String(team.creator) ? 'Owner' : 'Member',
      }));
    }

    return res.render('teams/show', {
      title: team.name,
      team,
      members,
      scrims,
      errors: [],
    });
  } catch (err) {
    console.error('View team error:', err);
    return next(err);
  }
};
