const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { saveCart, getCart } = require("../controllers/cart.controller");

router.post("/", auth, saveCart);
router.get("/", auth, getCart);

module.exports = router;
