const express = require("express");
const { body, check } = require("express-validator");
const authController = require("../controller/authController");
const userController = require("../controller/userController");
const deptController = require("../controller/deptController");

const router = express.Router();

router.use(authController.protect);
router.get(
  "/",
  authController.restrictTo("coordinator", "admin"),
  userController.getAllUsers
);

router.post(
  "/newAdmin",
  authController.restrictTo("admin"),
  userController.createAdminAccount
);

router.get(
  "/courseregstudent",
  authController.restrictTo("coordinator"),
  userController.findCourseStudents
);

router.get(
  "/displaycourses",
  authController.restrictTo("student"),
  userController.displayCourses
);

router.patch(
  "/registercourses",
  authController.restrictTo("student"),
  userController.registerCourses
);
router.patch(
  "/selectDept",
  authController.restrictTo("student"),
  deptController.selectDepartment
);
router.patch(
  "/updateMe",
  authController.restrictTo("student"),
  userController.updateMe
);
router.get(
  "/checkResult",
  authController.restrictTo("student"),
  userController.checkResult
);

router.patch("/updatepassword", authController.updatePassword);

router.patch(
  "/gradeResult",
  authController.restrictTo("coordinator", "admin"),
  userController.gradeCourses
);

router.get(
  "/:id",
  authController.restrictTo("coordinator", "admin"),
  userController.getAUser
);

module.exports = router;
