const { validationResult } = require('express-validator');

const HireProfile = require('../models/HireProfile');
const WorkProof = require('../models/WorkProof');
const User = require('../models/User');
const Profile = require('../models/Profile');

function splitList(value, maxItems = 12) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxItems);
}

exports.dashboard = async (req, res) => {
  try {
    let hire = await HireProfile.findOne({ userId: req.session.userId });

    if (!hire) {
      hire = await HireProfile.create({
        userId: req.session.userId,
        isActive: false,
        skills: [],
        categories: [],
        pricing: '',
        availability: '',
      });
    }

    const proofs = await WorkProof.find({ userId: req.session.userId }).sort({
      createdAt: -1,
    });

    return res.render('dashboard/quickhire/index', {
      title: 'QuickHire',
      hire,
      proofs: proofs || [],
      errors: [],
    });
  } catch (err) {
    console.error('[QuickHire Dashboard]', err);

    return res.status(500).render('dashboard/quickhire/index', {
      title: 'QuickHire',
      hire: {
        isActive: false,
        skills: [],
        categories: [],
        pricing: '',
        availability: '',
      },
      proofs: [],
      errors: [{ msg: 'Failed to load QuickHire dashboard.' }],
    });
  }
};

exports.postDashboard = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const hire = await HireProfile.findOne({ userId: req.session.userId });
    const proofs = await WorkProof.find({ userId: req.session.userId });

    return res.status(400).render('dashboard/quickhire/index', {
      title: 'QuickHire',
      hire:
        hire || {
          isActive: false,
          skills: [],
          categories: [],
          pricing: '',
          availability: '',
        },
      proofs: proofs || [],
      errors: errors.array(),
    });
  }

  try {
    await HireProfile.findOneAndUpdate(
      { userId: req.session.userId },
      {
        isActive: req.body.isActive === 'on',
        skills: splitList(req.body.skills, 20),
        categories: splitList(req.body.categories, 12),
        pricing: String(req.body.pricing || '').trim().slice(0, 200),
        availability: String(req.body.availability || '').trim().slice(0, 200),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.redirect('/dashboard/quickhire');
  } catch (err) {
    console.error('[QuickHire Save]', err);

    const proofs = await WorkProof.find({ userId: req.session.userId });

    return res.status(500).render('dashboard/quickhire/index', {
      title: 'QuickHire',
      hire: {
        isActive: req.body.isActive === 'on',
        skills: splitList(req.body.skills, 20),
        categories: splitList(req.body.categories, 12),
        pricing: req.body.pricing || '',
        availability: req.body.availability || '',
      },
      proofs: proofs || [],
      errors: [{ msg: 'Failed to save QuickHire profile.' }],
    });
  }
};

exports.hireIndex = async (req, res) => {
  try {
    const hireProfiles = await HireProfile.find({ isActive: true })
      .populate('userId')
      .sort({ updatedAt: -1 });

    const userIds = hireProfiles
      .filter((hire) => hire.userId)
      .map((hire) => hire.userId._id);

    const profiles = await Profile.find({ userId: { $in: userIds } });

    const profileMap = {};

    profiles.forEach((profile) => {
      profileMap[profile.userId.toString()] = profile;
    });

    return res.render('hire/index', {
      title: 'Hire Talent',
      hireProfiles,
      profileMap,
    });
  } catch (err) {
    console.error('[Hire Index]', err);

    return res.status(500).render('hire/index', {
      title: 'Hire Talent',
      hireProfiles: [],
      profileMap: {},
    });
  }
};

exports.hireProfile = async (req, res, next) => {
  try {
    const username = String(req.params.username || '').toLowerCase();

    const user = await User.findOne({ username });

    if (!user) return next();

    const hire = await HireProfile.findOne({
      userId: user._id,
      isActive: true,
    });

    if (!hire) return next();

    const profile = await Profile.findOne({ userId: user._id });
    const proofs = await WorkProof.find({ userId: user._id }).sort({
      createdAt: -1,
    });

    return res.render('hire/show', {
      title: `${profile?.displayName || user.username} - Hire`,
      user,
      profile,
      hire,
      proofs: proofs || [],
    });
  } catch (err) {
    return next(err);
  }
};
