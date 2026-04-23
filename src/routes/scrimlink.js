const express = require('express');
const { body } = require('express-validator');
const scrimController = require('../controllers/scrimlinkController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Dashboard main
router.get('/', requireAuth, scrimController.dashboard);

// Create team
router.post(
  '/teams',
  requireAuth,
  [
    body('name').trim().isLength({ min: 3, max: 50 }).withMessage('Team name must be between 3 and 50 characters'),
    body('description').trim().isLength({ max: 500 }).withMessage('Description too long'),
  ],
  scrimController.createTeam
);

module.exports = router;