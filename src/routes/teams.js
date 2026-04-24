const express = require('express');
const { body } = require('express-validator');

const teamController = require('../controllers/teamController');
const scrimController = require('../controllers/scrimlinkController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

console.log('[teams route] teamController:', teamController);
console.log('[teams route] viewTeams:', teamController.viewTeams);
console.log('[teams route] viewTeam:', teamController.viewTeam);

router.get('/', teamController.viewTeams);
router.get('/:slug', teamController.viewTeam);

router.post(
  '/:teamId/scrims',
  requireAuth,
  [
    body('description')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Description must be between 10 and 500 characters'),

    body('region')
      .trim()
      .notEmpty()
      .withMessage('Region is required'),

    body('schedule')
      .optional()
      .isISO8601()
      .withMessage('Invalid date'),
  ],
  scrimController.createScrim
);

module.exports = router;
