const express = require("express");
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const bookService = require("../services/service.js");

module.exports = router;
