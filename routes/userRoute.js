const express = require("express");
const { body, check } = require("express-validator");
const authController = require("../controller/authController");
const userController = require("../controller/userController");
const deptController = require("../controller/deptController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.get(
  "/",
  authController.protect,
  authController.restrictTo("coordinator"),
  userController.getAllUsers
);

router.patch(
  "/updateDept",
  authController.protect,
  deptController.updateDepartment
);
module.exports = router;
