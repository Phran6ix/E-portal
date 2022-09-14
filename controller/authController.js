const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("../utils/appError");

const catchAsync = require("../utils/catchAsync");

const generateJWT = function (id) {
  return jwt.sign(id, process.env.JWT_SECRET);
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    firstName: req.body.firstname,
    lastName: req.body.lastname,
    middleName: req.body.middlename,
    matric: req.body.matric,
    role: req.body.role,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmpassword,
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
  const user = await User.findOne({
    $or: [{ email: req.body.email }, { matric: req.body.matric }],
  }).select("+password");

  if (!user || !(await user.comparePassword(req.body.password, user.password)))
    return next(new AppError("Invalid Credentials", 400));

  //   if user is found, compare the passwords
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
    return next(new AppError("Invalid Token ", 400));
  }
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You Do not have Acess ", 400));
    }
    next();
  };
};
