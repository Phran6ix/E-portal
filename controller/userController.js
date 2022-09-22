const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const Dept = require("../models/deptModel");
const AppError = require("../utils/appError");
const { partCourses } = require("./deptController");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "sucess",
    range: users.length,
    data: {
      users,
    },
  });
});
exports.getAUser = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ _id: req.params.id }).populate({
    path: "courses",
  });

  res.status(200).json({
    status: "successful",
    data: {
      user,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const id = req.user._id;

  const user = await User.findByIdAndUpdate(id, {
    firstName: req.body.firstname,
    lastName: req.body.lastname,
    email: req.body.email,
    department: req.body.department,
  }).select("+department");

  if (!user) {
    return next(new AppError("An Error Occunred", 400));
  }

  res.status(201).json({
    status: "Success",
    data: {
      user,
    },
  });
});

exports.displayCourses = catchAsync(async (req, res, next) => {
  const dept = await Dept.findOne({ name: req.user.department }).populate({
    path: "part",
    populate: {
      path: "courses",
      model: "Course",
      select: "title code -_id",
    },
  });

  // console.log(req.user);

  if (!dept) {
    return next(
      new AppError(
        "Please update your department before registering courses",
        404
      )
    );
  }

  const deptPart = dept.part.find((prt) => {
    return prt.part === req.user.part;
  });

  res.status(200).json({
    status: "Successful",
    courses: deptPart.courses,
  });
});

exports.registerCourses = catchAsync(async (req, res, next) => {
  const dept = await Dept.findOne({ name: req.user.department }).populate({
    path: "part",
    populate: {
      path: "courses",
      model: "Course",
      select: "title code",
    },
  });

  if (!dept) {
    return next(
      new AppError("Please complete your department registration", 404)
    );
  }

  const Dpart = dept.part.find((prt) => {
    return prt.part === req.user.part;
  });

  const availableCourses = Dpart.courses;
  // Condition to check if the inputed courses in the array of available courses

  const availableCoursesCode = availableCourses.map((course) => {
    return course.code;
  });
  let courseID = [];

  for (let course of req.body.courses) {
    if (!availableCoursesCode.includes(course)) {
      return next(new AppError("Invalid Input", 400));
    }
    const toUpload = availableCourses.find((x) => {
      return x.code === course;
    });
    courseID.push(toUpload._id);
  }

  const user = await User.findByIdAndUpdate(req.user.id, {
    courses: courseID,
  }).select("firstName lastName matric courses department part");

  res.status(200).json({
    status: "Successful",
    data: {
      user,
    },
  });
});
