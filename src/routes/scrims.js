const express = require('express');
const scrimController = require('../controllers/scrimlinkController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, scrimController.browseScrims);

module.exports = router;