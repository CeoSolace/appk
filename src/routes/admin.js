const express = require('express');
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAdmin, adminController.dashboard);
router.post('/users/:userId/suspend', requireAdmin, adminController.toggleSuspend);
router.post('/reports/:reportId/delete', requireAdmin, adminController.deleteReport);

module.exports = router;