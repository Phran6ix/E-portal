const mongoose = require("mongoose");
const multer = require("multer");

const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const factory = require("../controller/handlerFactory");
const Dept = require("../models/deptModel");
const AppError = require("../utils/appError");
const { partCourses } = require("./deptController");

exports.getAllUsers = factory.getDocuments(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next;
};

exports.getAUser = factory.getADocument(User, {
  path: "courses",
  select: "firstName lastName title code grade unit",
});

exports.updateMe = factory.updateADocument(
  User,

  "+department"
);

exports.displayCourses = catchAsync(async (req, res, next) => {
  const dept = await Dept.findOne({ name: req.user.department });

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

  await user.save();
  res.status(200).json({
    status: "Successful",
  });
});

exports.checkResult = catchAsync(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    status: "success",
    results: user.results,
  });
});

const memoryStorage = multer.memoryStorage();

function multerFilter(req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("please upload an image", 400), false);
  }
}

const upload = multer({
  storage: memoryStorage,
  fileFilter: multerFilter,
});

exports.uploadProfilePhoto = upload.single("profile");
