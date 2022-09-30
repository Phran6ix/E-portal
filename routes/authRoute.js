const { Router } = require("express");

const router = Router();
const authController = require("../controller/authController");

router.patch("/resetpassword/:resetToken", authController.resetPassword);
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgotpassword", authController.forgotPassword);

module.exports = router;
