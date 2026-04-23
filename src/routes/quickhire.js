const express = require('express');
const { body } = require('express-validator');
const quickhireController = require('../controllers/quickhireController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Dashboard QuickHire
router.get('/', requireAuth, quickhireController.dashboard);
router.post(
  '/',
  requireAuth,
  [
    body('pricing').trim().isLength({ max: 200 }).withMessage('Pricing info too long'),
    body('availability').trim().isLength({ max: 200 }).withMessage('Availability info too long'),
  ],
  quickhireController.postDashboard
);

module.exports = router;