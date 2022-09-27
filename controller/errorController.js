const AppError = require("../utils/appError");
const sendError = function (err, req, res, next) {
  return res.status(err.statusCode).json({
    error: err,
    err: err.errors,
    status: err.status,
    message: err.message,
    stack: err.stack,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error occured";

  sendError(err, req, res, next);
};
