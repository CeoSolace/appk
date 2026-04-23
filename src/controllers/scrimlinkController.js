const Team = require('../models/Team');
const TeamMember = require('../models/TeamMember');
const ScrimPost = require('../models/ScrimPost');
const User = require('../models/User');
const Profile = require('../models/Profile');
const slugify = require('../utils/slugify');
const { validationResult } = require('express-validator');

// Dashboard: manage user's teams and scrims
exports.dashboard = async (req, res) => {
  try {
    const teams = await Team.find({ creator: req.session.userId });
    res.render('dashboard/scrimlink/index', { title: 'ScrimLink', teams, errors: [] });
  } catch (err) {
    console.error(err);
    res.status(500).render('dashboard/scrimlink/index', { title: 'ScrimLink', teams: [], errors: [{ msg: 'Failed to load teams' }] });
  }
};

// Create a new team
exports.createTeam = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const teams = await Team.find({ creator: req.session.userId });
    return res.status(400).render('dashboard/scrimlink/index', { title: 'ScrimLink', teams, errors: errors.array() });
  }
  try {
    const count = await Team.countDocuments({ creator: req.session.userId });
    if (count >= 3) {
      const teams = await Team.find({ creator: req.session.userId });
      return res.render('dashboard/scrimlink/index', { title: 'ScrimLink', teams, errors: [{ msg: 'You have reached the maximum number of teams (3).' }] });
    }
    const { name, description, tags } = req.body;
    let slugBase = slugify(name);
    let slug = slugBase;
    let i = 1;
    while (await Team.findOne({ slug })) {
      slug = `${slugBase}-${i}`;
      i += 1;
    }
    const team = new Team({
      creator: req.session.userId,
      slug,
      name,
      description,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    });
    await team.save();
    // Make the creator a captain
    const member = new TeamMember({ team: team._id, user: req.session.userId, role: 'captain' });
    await member.save();
    res.redirect('/dashboard/scrimlink');
  } catch (err) {
    console.error(err);
    const teams = await Team.find({ creator: req.session.userId });
    res.status(500).render('dashboard/scrimlink/index', { title: 'ScrimLink', teams, errors: [{ msg: 'Server error' }] });
  }
};

// View all teams
exports.viewTeams = async (req, res) => {
  try {
    const teams = await Team.find();
    res.render('teams/index', { title: 'Teams', teams });
  } catch (err) {
    console.error(err);
    res.status(500).render('teams/index', { title: 'Teams', teams: [] });
  }
};

// View a single team page
exports.viewTeam = async (req, res, next) => {
  const slug = req.params.slug;
  try {
    const team = await Team.findOne({ slug });
    if (!team) return next();
    const members = await TeamMember.find({ team: team._id }).populate('user');
    const scrims = await ScrimPost.find({ team: team._id, archived: false });
    res.render('teams/show', { title: team.name, team, members, scrims });
  } catch (err) {
    next(err);
  }
};

// Create a scrim post
exports.createScrim = async (req, res) => {
  const errors = validationResult(req);
  const teamId = req.params.teamId;
  if (!errors.isEmpty()) {
    return res.redirect(`/teams/${teamId}`);
  }
  try {
    const team = await Team.findById(teamId);
    if (!team || team.creator.toString() !== req.session.userId) {
      return res.status(403).render('errors/403');
    }
    // Check scrim count per team
    const count = await ScrimPost.countDocuments({ team: teamId, archived: false });
    if (count >= 5) {
      return res.redirect(`/teams/${team.slug}`);
    }
    const { description, region, schedule } = req.body;
    const scrim = new ScrimPost({
      team: teamId,
      slug: `${team.slug}-${Date.now()}`,
      description,
      region,
      schedule: schedule ? new Date(schedule) : null,
    });
    await scrim.save();
    res.redirect(`/teams/${team.slug}`);
  } catch (err) {
    console.error(err);
    res.redirect(`/teams/${req.params.slug}`);
  }
};

// Browse scrims
exports.browseScrims = async (req, res) => {
  try {
    // Exclude scrims from the user's own teams
    const myTeams = await Team.find({ creator: req.session.userId });
    const myTeamIds = myTeams.map((t) => t._id);
    const scrims = await ScrimPost.find({ archived: false, team: { $nin: myTeamIds } }).populate('team');
    res.render('scrims/index', { title: 'Find Scrims', scrims });
  } catch (err) {
    console.error(err);
    res.status(500).render('scrims/index', { title: 'Find Scrims', scrims: [] });
  }
};