const mongoose = require("mongoose");

const quizesSchema = mongoose.Schema(
  {
    teacherAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: false,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
    },
    session: {
      type: Number,
      required: true,
    },
    endDurationSeconds: { type: Number, required: true },
  },
  { collection: "quizes_courses" }
);

module.exports = mongoose.model("quizes_courses", quizesSchema);