const mongoose = require("mongoose");

const assignmentSchema = mongoose.Schema(
    {
      type: {
        type: String,
        required: true,
      },
      endDurationSeconds: { type: Number, required: true },
    },
    { collection: "assignment" }
  );

module.exports = mongoose.model("assignment", assignmentSchema);