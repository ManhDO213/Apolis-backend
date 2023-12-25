const mongoose = require("mongoose");

const attendanceSchema = mongoose.Schema(
  {
    studentAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: true
    },
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "schedule",
      required: true
    },
    isPresent: {
      type: Boolean,
      required: true
    }
  },
  { collection: "attendance" }
);

module.exports = mongoose.model("attendance", attendanceSchema);