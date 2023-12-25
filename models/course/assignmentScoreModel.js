const mongoose = require("mongoose");
const questionAnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  answerId: { type: mongoose.Schema.Types.ObjectId, required: false },
});
const assignmentScoresSchema = mongoose.Schema(
  {
    studentAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: false,
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "assignment",
    },
    questionAnwers: { type: [questionAnswerSchema], required: true },
    expectScore: { type: Number, required: true },
    actualScore: { type: Number, required: true },
    numCorrectAnswer: { type: Number, required: true },
    numberOfTimes: { type: Number, required: true },
  },
  { collection: "assignment_scores" }
);

module.exports = mongoose.model("assignment_scores", assignmentScoresSchema);
