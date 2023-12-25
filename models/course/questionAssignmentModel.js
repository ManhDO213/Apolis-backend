const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  value: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

const questionAssignmentSchema = mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "assignment",
    },
    question: {
      type: String,
      required: true,
    },
    answers: { type: [questionSchema], required: true },
  },
  { collection: "question_assignment" }
);

module.exports = mongoose.model("question_assignment", questionAssignmentSchema);