const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

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
  },
  staffId: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "input your email"],
    validate: [validator.isEmail, "input a valid email"],
    unique: [true, "Email already taken"],
  },
  courses: [
    {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  results: [
    {
      code: {
        type: String,
      },
      title: {
        type: String,
      },
      grade: {
        type: String,
      },
    },
  ],
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

  department: {
    type: String,
  },
  part: {
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

userSchema.methods.comparePassword = async function (
  inputPassword,
  userPassword
) {
  return await bcrypt.compare(inputPassword, userPassword);
};

const User = model("User", userSchema);
module.exports = User;
