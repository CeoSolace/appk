const express = require('express');
const { body } = require('express-validator');
const quickhireController = require('../controllers/quickhireController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, quickhireController.dashboard);

router.post(
  '/',
  requireAuth,
  [
    body('pricing').optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
    body('availability').optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
    body('skills').optional({ checkFalsy: true }).trim().isLength({ max: 300 }),
    body('categories').optional({ checkFalsy: true }).trim().isLength({ max: 300 }),
  ],
  quickhireController.postDashboard
);

module.exports = router;
