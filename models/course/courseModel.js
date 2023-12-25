const mongoose = require("mongoose");

const courseSchema = mongoose.Schema(
  {
    teacherAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    photoUrls: {
      type: Array,
      required: true,
    },
    videoUrls: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    totalSession: {
      type: Number,
      required: true,
    },
    feeCoin: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: false,
    },
  },
  { collection: "courses" }
);

module.exports = mongoose.model("courses", courseSchema);