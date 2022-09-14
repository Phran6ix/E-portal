const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const Dept = require("./deptModel");

const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "Input your firstname"],
  },
  lastName: {
    type: String,
    required: [true, "Input your lastname"],
  },
  middleName: {
    type: String,
    required: [true, "Input your middle name"],
  },
  matric: {
    type: String,
    required: [true, "Input your matric number"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "input your email"],
    validate: [validator.isEmail, "input a valid email"],
    unique: true,
  },
  role: {
    type: String,
    enum: {
      values: ["student", "coordinator", "admin"],
      message: "Invalid input",
    },
    default: "student",
  },
  password: {
    type: String,
    required: [true, "input password"],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: true,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "passwords are not the same",
    },
  },
  department: {
    type: String,
  },
  profilePhoto: {
    type: String,
    default: "default.jpg",
  },

  resetPasswordToken: {
    type: String,
  },
});

userSchema.virtual("fullname").get(function () {
  return this.firstName + " " + this.lastName;
});

userSchema.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 13);
  this.confirmPassword = undefined;
});

// userSchema.post("save", async function () {
//   const dept = await Dept.findOne(this.department);

//   console.log(dept);
// });

userSchema.methods.comparePassword = async function (
  inputPassword,
  userPassword
) {
  return await bcrypt.compare(inputPassword, userPassword);
};

const User = model("User", userSchema);
module.exports = User;
