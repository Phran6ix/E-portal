const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const multer = require("multer");
const { memoryStorage } = require("multer");

exports.getDocuments = (Model) =>
  catchAsync(async (req, res, next) => {
    const documents = await Model.find();

    res.status(200).json({
      status: "Success",
      range: documents.length,
      data: documents,
    });
  });

exports.getADocument = (Model, populateOut) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOut) query = query.populate(populateOut);

    const document = await query;
    if (!document) {
      return next(new AppError("Not Found", 404));
    }

    res.status(200).json({
      status: "Success",
      data: document,
    });
  });

exports.createADocument = (Model, createWith) =>
  catchAsync(async (req, res, next) => {
    let query;
    if (createWith) {
      query = await Model.create(createWith);
    } else {
      query = await Model.create(req.body);
    }

    res.status(200).json({
      status: "Success",
      data: query,
    });
  });

exports.updateADocument = (Model, selectThis) =>
  catchAsync(async (req, res, next) => {
    let document;
    if (selectThis) {
      document = Model.findByIdAndUpdate(req.params.id, updateWith).select(
        selectThis
      );
    }
    document = Model.findByIdAndUpdate(req.params.id, req.body);

    if (!document) {
      return next(new AppError("Not Found", 404));
    }

    res.status(200).json({
      status: "Success",
      data: document,
    });
  });

exports.deleteADocument = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      return next(new AppError("Not Found", 404));
    }

    res.status(200).json({
      status: "Success",
    });
  });
