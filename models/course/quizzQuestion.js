const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  value: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

const questionCourseSchema = mongoose.Schema(
  {
    teacherAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: false,
    },
    courseQuizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "quizes_courses",
    },
    question: {
      type: String,
      required: true,
    },
    answers: { type: [questionSchema], required: true },
  },
  { collection: "question_courses" }
);

module.exports = mongoose.model("question_courses", questionCourseSchema);