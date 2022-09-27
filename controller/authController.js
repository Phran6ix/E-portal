const { query } = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const bcrypt = require("bcrypt");
const catchAsync = require("../utils/catchAsync");

const generateJWT = function (id) {
  return jwt.sign(id, process.env.JWT_SECRET);
};

async function hashPassword(password) {
  const hashed = await bcrypt.hash(password, 13);
  return hashed;
}
exports.signup = catchAsync(async (req, res, next) => {
  if (req.body.role === "admin" || req.body.role === "coordinator") {
    return next(new AppError("You are not authorized for this operation", 400));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new AppError("Passwords are not the same", 400));
  }
  req.body.password = await hashPassword(req.body.password);

  const user = await User.create({
    firstName: req.body.firstname,
    lastName: req.body.lastname,
    middleName: req.body.middlename,
    matric: req.body.matric,
    email: req.body.email,
    staffId: req.body.staffId,
    password: req.body.password,
    profilePhoto: req.body.photo,
  });

  const token = generateJWT(user.id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { query, password } = req.body;
  if (!(query || password)) {
    return next(new AppError("Fields cannot be empty", 400));
  }

  let user;
  if (query.includes("@")) {
    user = await User.findOne({ email: query }).select("+password");
  } else if (query.includes("/") && query.length === 12) {
    user = await User.findOne({ matric: query }).select("+password");
  } else if (query.includes("/") && query.length === 11) {
    user = await User.findOne({ staffId: query }).select("+password");
  }

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError("Invalid Credentials", 400));
  }

  const token = generateJWT(user.id);
  res.status(200).json({
    status: "sucess",
    token,
    data: {
      user,
    },
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in", 400));
  }

  const decodeUser = jwt.verify(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decodeUser);

  if (!currentUser) {
    return next(new AppError("Invalid Token, login again ", 400));
  }
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log(roles);
      return next(new AppError("You Do not have Access ", 400));
    }
    next();
  };
};
