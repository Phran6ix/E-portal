const { Schema, model } = require("mongoose");

const deptSchema = new Schema({
  name: {
    type: String,
    required: [true, "A department must have a name"],
  },
  students: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Dept = new model("Dept", deptSchema);

module.exports = Dept;
