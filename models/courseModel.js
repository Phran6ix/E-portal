const { Schema, model } = require("mongoose");

const courseSchema = new Schema({
  title: {
    type: String,
    required: [true, "Input the title of the course"],
    unique: [true, "Course title already exist"],
  },
  code: {
    type: String,
    required: [true, "Input the course code"],
    unique: [true, "Course code already exist"],
  },
  department: {
    type: String,
  },
  part: {
    type: String,
  },
  registeredStudents: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

courseSchema.pre("save", function () {
  const Inicode = this.code.slice(0, 3).toUpperCase();
  const finalCode = Inicode + this.code.slice(3);

  this.code = finalCode;
});

const Course = new model("Course", courseSchema);

module.exports = Course;
