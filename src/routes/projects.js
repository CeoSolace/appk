const express = require('express');
const devproofController = require('../controllers/devproofController');

const router = express.Router();

router.get('/:slug', devproofController.showProject);

module.exports = router;