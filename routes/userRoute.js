const express = require("express");
const { body, check } = require("express-validator");
const authController = require("../controller/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
module.exports = router;
