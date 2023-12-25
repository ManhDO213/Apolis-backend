const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  duration: { type: Number, required: true },
});

const documentCourseSchema = mongoose.Schema(
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
    documents: { type: [documentSchema], required: true },
  },
  { collection: "document_courses" }
);

module.exports = mongoose.model("document_courses", documentCourseSchema);