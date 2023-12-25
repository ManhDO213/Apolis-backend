const mongoose = require("mongoose");

const courseRegistrationSchema = mongoose.Schema(
  {
    studentAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
    },
    isCompleted: {
      type: Boolean,
      required: true,
    },
    progress: {
      type: Number,
      required: true,
    },
  },
  { collection: "course_registration" }
);

module.exports = mongoose.model(
  "course_registration",
  courseRegistrationSchema
);