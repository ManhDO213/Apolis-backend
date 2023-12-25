const mongoose = require("mongoose");
const postSchema = mongoose.Schema(
  {
    studentAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
    },
    content: {
      type: String,
      required: false,
    },
    files: {
      type: Array,
      required: true,
    },
    isPublic: {
      type: Boolean,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { collection: "posts" }
);

module.exports = mongoose.model("posts", postSchema);