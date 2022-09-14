const Dept = require("../models/deptModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.createDept = catchAsync(async (req, res, next) => {
  const department = await Dept.create(req.body);

  res.status(201).json({
    status: "Successful created",
    data: {
      department,
    },
  });
});

exports.getAllDepts = catchAsync(async (req, res, next) => {
  const depts = await Dept.find();

  res.status(200).json({
    status: "success",
    data: {
      depts,
    },
  });
});

exports.updateDepartment = catchAsync(async (req, res, next) => {
  const dept = await Dept.findOne({ name: req.body.name });

  if (!dept) {
    return next(new AppError("Department name not found, try again"));
  }

  const student = dept.students;

  student.push(req.user._id);

  await dept.save();

  res.status(200).json({
    status: "Success",
    data: {
      dept,
    },
  });
});
