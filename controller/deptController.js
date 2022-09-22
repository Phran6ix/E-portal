const Dept = require("../models/deptModel");
const User = require("../models/userModel");
const Course = require("../models/courseModel");
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

exports.createPartDept = catchAsync(async (req, res, next) => {
  const id = req.params.dept;

  const department = await Dept.findById(id);

  if (!department) {
    return next(new AppError("Department not found", 404));
  }

  //   Select the part field in the schema and update
  let intPart = department.part;
  //   intPart.push(req.body);

  intPart.push(req.body);

  const dept = await department.save();
  console.log("body", intPart, dept);

  res.status(201).json({
    status: "Updated Successfully",
  });
});

exports.partCourses = catchAsync(async (req, res, next) => {
  // TO CREATE THE COURSE DOCUMENT
  const course = await Course.create({
    title: req.body.title,
    code: req.body.code,
  });

  const id = req.params.dept;
  const dept = await Dept.findById(id);

  if (!dept) {
    return next(new AppError("Document not found", 404));
  }

  const deptPart = dept.part.find((prt) => {
    return prt.part === req.params.part;
  });

  if (!deptPart) {
    return next(new AppError("Document not found", 404));
  }

  deptPart.courses.push(course);
  await dept.save();

  course.department = dept.name;
  course.part = deptPart.part;
  await course.save();

  res.status(201).json({
    status: "Uploaded Successful",
    data: {
      course,
    },
  });
});

exports.getAllDepts = catchAsync(async (req, res, next) => {
  const depts = await Dept.find().select("-students");

  res.status(200).json({
    status: "success",
    data: {
      depts,
    },
  });
});

exports.getADept = catchAsync(async (req, res, next) => {
  const id = req.params.dept;

  const department = await Dept.findById(id).populate({
    path: "part",
    populate: {
      path: "courses",
      model: "Course",
      select: "-_id -__v ",
    },
  });

  if (!department) {
    return next(new AppError("Not Found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      department,
    },
  });
});

exports.updateDepartment = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const department = await Dept.findByIdAndUpdate(id, req.body).select(
    "-students"
  );

  if (!department) {
    return next(new AppError("An Error Occured", 400));
  }

  res.status(201).json({
    status: "Update Successful",
    data: {
      department,
    },
  });
});

exports.selectDepartment = catchAsync(async (req, res, next) => {
  const dept = await Dept.findOne({ name: req.body.name });

  if (!dept) {
    return next(new AppError("An error occured, try again"));
  }

  const student = dept.part.find((prt) => {
    return prt.part === req.body.part;
  });

  const id = req.user._id;

  if (student.students.includes(id)) {
    return next(new AppError("Student already in the database", 400));
  }

  student.students.push(req.user._id);

  await User.findByIdAndUpdate(id, {
    department: req.body.name,
    part: req.body.part,
  });

  await dept.save();

  res.status(200).json({
    status: "Success",
    data: {
      dept,
    },
  });
});

exports.removeStudent = catchAsync(async (req, res, next) => {
  const dept = await Dept.findOne({ name: req.body.name }).populate({
    path: "part",
    populate: {
      path: "students",
      select: "firstName lastName matric",
    },
  });

  if (!dept) {
    return next(new AppError("Document not found", 404));
  }

  const tpart = dept.part.find((dpt) => {
    return dpt.part === req.body.part;
  });

  const updatedList = tpart.students.filter((std) => {
    return std.matric !== req.body.matric;
  });

  tpart.students = updatedList;
  await dept.save();

  res.status(200).json({
    status: "Successful",
    dept,
  });
});
