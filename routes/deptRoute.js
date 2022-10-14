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
  "/:id",
  authController.restrictTo("coordinator", "admin"),
  deptController.getADept
);
router.get(
  "/",
  authController.restrictTo("coordinator", "admin"),
  deptController.getAllDepts
);

router.use(authController.restrictTo("admin"));
router.patch("/removestudent", deptController.removeStudent);
router.post("/createDept", deptController.createDept);
router.patch("/:id", deptController.updateDepartment);
router.delete("/deletedepartment/:id", deptController.deleteDepartment);
router.patch("/updatepart/:dept", deptController.createPartDept);
router.patch("/updatecourses/:dept/:part", deptController.partCourses);

module.exports = router;
