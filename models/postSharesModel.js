const mongoose = require("mongoose");

const postShareSchema = mongoose.Schema(
  {
    studentAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts",
    },
  },
  { collection: "post_shares" }
);

module.exports = mongoose.model("post_shares", postShareSchema);