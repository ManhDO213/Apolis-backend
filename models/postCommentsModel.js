const mongoose = require("mongoose");

const postCommentSchema = mongoose.Schema(
  {
    studentAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts",
    },
    content: {
      type: String,
      required: false,
    },
    file: [
      {
        type: { type: String, required: false },
        url: { type: String, required: false },
        gif: { type: Object, required: false },
      },
    ],
  },
  { collection: "post_comments" }
);

module.exports = mongoose.model("postcomment", postCommentSchema);