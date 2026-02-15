const express = require("express");
const router = express.Router();
const { testAPI } = require("../controllers/test.controller");

router.get("/", testAPI);

module.exports = router;
