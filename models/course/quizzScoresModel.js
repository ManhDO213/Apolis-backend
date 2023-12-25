const mongoose = require("mongoose");
const questionAnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  answerId: { type: mongoose.Schema.Types.ObjectId, required: false },
});
const quizScoresSchema = mongoose.Schema(
  {
    studentAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: false,
    },
    cycleCourseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cycle_courses",
    },
    courseQuizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "quizes_courses",
    },
    questionAnwers: { type: [questionAnswerSchema], required: true },
    expectScore: { type: Number, required: true },
    actualScore: { type: Number, required: true },
    numCorrectAnswer: { type: Number, required: true },
    numberOfTimes: { type: Number, required: true },
  },
  { collection: "quizz_scores" }
);

module.exports = mongoose.model("quizz_scores", quizScoresSchema);