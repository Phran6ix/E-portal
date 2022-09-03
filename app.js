const express = require("express");
const userRoute = require("./routes/userRoute");
const globalError = require("./controller/errorController");

const app = express();

app.use(express.json());

app.use("/api/user", userRoute);

app.use(globalError);

module.exports = app;
