const express = require('express');
const { body } = require('express-validator');
const devproofController = require('../controllers/devproofController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Dashboard list
router.get('/', requireAuth, devproofController.dashboard);

// Import repos
router.get('/import', requireAuth, devproofController.getImport);
router.post('/import', requireAuth, devproofController.postImport);

module.exports = router;