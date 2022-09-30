const express = require("express");
const userRoute = require("./routes/userRoute");
const deptRoute = require("./routes/deptRoute");
const authRoute = require("./routes/authRoute");
const globalError = require("./controller/errorController");

const app = express();

app.use(express.json());

app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/dept", deptRoute);

app.use(globalError);

module.exports = app;
