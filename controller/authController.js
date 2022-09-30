const { query } = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const catchAsync = require("../utils/catchAsync");
const { findOne } = require("../models/userModel");
const Email = require("../utils/email");

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
  const currentUser = await User.findById(decodeUser).select("+password");

  if (!currentUser) {
    return next(new AppError("Invalid Token, login again ", 400));
  }
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You Do not have Access ", 400));
    }
    next();
  };
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = req.user;
  if (!(await bcrypt.compare(req.body.password, user.password))) {
    return next(new AppError("Invalid password", 404));
  }

  if (!(req.body.newPassword === req.body.confirmPassword)) {
    return next(new AppError("Passwords are not the same", 404));
  }
  user.password = await hashPassword(req.body.newPassword);

  await user.save();

  res.status(200).json({
    status: "success",
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = await crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordToken = hashedToken;
  await user.save();

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/auth/resetpassword/${resetToken}`;

  // await sendEmail("Your reset Password Token", hashedToken);
  await new Email(user, "Reset Password").send(
    "Reset password",
    `
   Click the link to reset your password ${resetUrl}`
  );

  try {
    res.status(200).json({
      status: "success",
      message: "Email Sent",
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: "Error in sending email",
    });
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = await crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
  });
  if (!user) {
    return next(new AppError("Invalid token", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new AppError("Passwords are not the same", 400));
  }

  user.password = req.body.newPassword;
  await user.save();

  res.status(200).json({
    status: "Update successful",
  });
});
