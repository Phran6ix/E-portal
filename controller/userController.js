const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const Dept = require("../models/deptModel");
const AppError = require("../utils/appError");
const { partCourses } = require("./deptController");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({ role: "student" });

  res.status(200).json({
    status: "success",
    range: users.length,
    data: {
      users,
    },
  });
});
exports.getAUser = catchAsync(async (req, res, next) => {
  const user = await User.findOne({
    _id: req.params.id,
  }).populate({
    path: "courses",
    select: "firstName lastName title code grade unit",
  });

  if (!user) {
    return next(new AppError("Document not found", 404));
  }

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
      select: "title code _id",
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

  let user = await req.user.populate("courses");

  user.courses = courseID;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "Successful",
  });
});

exports.createAdminAccount = catchAsync(async (req, res, next) => {
  const admin = await User.create({
    firstName: req.body.firstname,
    lastName: req.body.lastname,
    middleName: req.body.middlename,
    email: req.body.email,
    role: req.body.role,
    staffId: req.body.staffId,
    department: req.body.department,
    password: req.body.password,
    confirmPassword: req.body.confirmpassword,
  });

  res.status(201).json({
    status: "Successful",
    data: {
      admin,
    },
  });
});

exports.findCourseStudents = catchAsync(async (req, res, next) => {
  const student = await User.find({ role: "student" }).populate({
    path: "courses",
    select: "title code grade ",
  });

  let registeredStudents = student
    .filter((stu) => {
      let stuCourses = stu.courses;

      return stuCourses.find((course) => {
        return course.code === req.body.code;
      });
    })
    .map((stu) => {
      return stu.matric;
    });

  res.status(200).json({
    status: "Success",
    data: {
      registeredStudents,
    },
  });
});

exports.gradeCourses = catchAsync(async (req, res, next) => {
  const matric = req.body.matric;
  const user = await User.findOne({ matric }).populate("courses");
  if (!user) {
    return next(new AppError("Invalid Matric number, try again", 404));
  }

  //  find the course to grade
  const Gcourse = user.courses.find((course) => {
    return course.code === req.body.coursecode;
  });

  const updateResult = {
    code: Gcourse.code,
    title: Gcourse.title,
    grade: req.body.score,
  };

  user.results.push(updateResult);
  console.log(user.results);

  await user.save();
  res.status(200).json({
    status: "Successful",
  });
});
