const express = require('express');
const router = express.Router();
const { queryChatbot } = require('../controllers/chatbotController');

router.post('/query', queryChatbot);

module.exports = router;
