const mongoose = require("mongoose");

const postLikeSchema = mongoose.Schema(
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
  { collection: "post_likes" }
);

module.exports = mongoose.model("post_likes", postLikeSchema);