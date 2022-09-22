const express = require("express");
const { body, check } = require("express-validator");
const authController = require("../controller/authController");
const userController = require("../controller/userController");
const deptController = require("../controller/deptController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.use(authController.protect);
// router.get(
//   "/",
//   authController.restrictTo("coordinator", "admin"),
//   userController.getAllUsers
// );

router
  .route(":/id")
  .get(
    authController.restrictTo("coordinator", "admin"),
    userController.getAUser
  );

router.use(authController.restrictTo("student"));
router.get(
  "/displaycourses",
  authController.restrictTo("student"),
  userController.displayCourses
);
router.patch("/registercourses", userController.registerCourses);
router.patch("/selectDept", deptController.selectDepartment);
router.patch("/updateMe", userController.updateMe);

module.exports = router;
