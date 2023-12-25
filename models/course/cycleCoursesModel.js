const mongoose = require("mongoose");

const cycleCourseSchema = mongoose.Schema(
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
    googleMeetUrl: {
      type: String,
      required: true,
    },
    minStudent: {
      type: Number,
      required: true,
    },
    maxStudent: {
      type: Number,
      required: true,
    },
    registrationPeriod: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      required: false,
    },
    isCompleted: {
      type: Boolean,
      required: false,
    },
    lockReason: {
      type: String,
      required: false,
    },
  },
  { collection: "cycle_courses" }
);

module.exports = mongoose.model("cycle_courses", cycleCourseSchema);
