const express = require('express');
const devproofController = require('../controllers/devproofController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, devproofController.dashboard);
router.get('/import', requireAuth, devproofController.getImport);
router.post('/import', requireAuth, devproofController.postImport);

module.exports = router;
