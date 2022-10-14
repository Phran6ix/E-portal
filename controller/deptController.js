const Dept = require("../models/deptModel");
const User = require("../models/userModel");
const Course = require("../models/courseModel");
const factory = require("../controller/handlerFactory");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllDepts = factory.getDocuments(Dept);
exports.getADept = factory.getADocument(Dept);

exports.createDept = factory.createADocument(Dept);
exports.updateDepartment = factory.updateADocument();
exports.deleteDepartment = factory.deleteADocument(Dept);

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
    unit: req.body.unit,
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
    status: "Update Successful",
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
