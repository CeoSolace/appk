const HireProfile = require('../models/HireProfile');
const WorkProof = require('../models/WorkProof');

exports.dashboard = async (req, res) => {
  try {
    let hire = await HireProfile.findOne({ userId: req.session.userId });

    if (!hire) {
      hire = {
        isActive: false,
        skills: [],
        categories: [],
        pricing: '',
        availability: '',
      };
    }

    const proofs = await WorkProof.find({ userId: req.session.userId });

    res.render('dashboard/quickhire/index', {
      title: 'QuickHire',
      hire,
      proofs: proofs || [],
      errors: [],
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    console.error(err);

    res.render('dashboard/quickhire/index', {
      title: 'QuickHire',
      hire: {},
      proofs: [],
      errors: [{ msg: 'Failed to load data' }],
      csrfToken: req.csrfToken(),
    });
  }
};
