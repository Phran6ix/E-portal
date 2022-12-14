const { Schema, model, SchemaType } = require("mongoose");

const deptSchema = new Schema({
  name: {
    type: String,
    required: [true, "A department must have a name"],
    unique: true,
  },

  part: [
    {
      part: {
        type: String,
      },
      students: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      courses: [
        {
          type: Schema.Types.ObjectId,
          ref: "Courses",
        },
      ],
    },
  ],
});

deptSchema.pre(/^findOne/, function () {
  this.populate({
    path: "part",
    populate: {
      path: "courses",
      model: "Course",
      select: "title code -_id -__v",
    },
  }).select("name part");
});

const Dept = new model("Dept", deptSchema);

module.exports = Dept;
