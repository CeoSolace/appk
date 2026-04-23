const express = require('express');
const quickhireController = require('../controllers/quickhireController');

const router = express.Router();

router.get('/', quickhireController.hireIndex);
router.get('/:username', quickhireController.hireProfile);

module.exports = router;