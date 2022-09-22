const { Router } = require("express");
const deptController = require("../controller/deptController");
const authController = require("../controller/authController");

const router = Router();

router.use(authController.protect);

router.patch(
  "/part/:dept",
  authController.restrictTo("coordinator", "admin"),
  deptController.createPartDept
);
router.get(
  "/:dept",
  authController.restrictTo("coordinator", "admin"),
  deptController.getADept
);
router.get(
  "/",
  authController.restrictTo("coordinator", "admin"),
  deptController.getAllDepts
);

router.use(authController.restrictTo("admin"));
router.post("/createDept", deptController.createDept);
router.patch("/removestudent", deptController.removeStudent);
router.patch("/:id", deptController.updateDepartment);
router.patch("/updatepart/:dept", deptController.createPartDept);
router.patch("/updatecourses/:dept/:part", deptController.partCourses);

module.exports = router;
