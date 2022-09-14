const { Router } = require("express");
const deptController = require("../controller/deptController");
const authController = require("../controller/authController");

const router = Router();

router.use(authController.protect, authController.restrictTo("admin"));

router.get("/", deptController.getAllDepts);
router.post("/createDept", deptController.createDept);

module.exports = router;
