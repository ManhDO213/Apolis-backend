const postModel = require("../../../models/postModel");
const mongoose = require("mongoose");

const getListPost = async (limit, page, filter, accountId) => {
  const skip = (page - 1) * limit;
  const pipeline = [
    {
      $match: filter,
    },
    {
      $lookup: {
        from: "profile",
        localField: "studentAccountId",
        foreignField: "accountId",
        as: "profile",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              avatarUrl: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$profile",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $lookup: {
        from: "post_comments",
        localField: "_id",
        foreignField: "postId",
        as: "comments",
      },
    },
    {
      $addFields: {
        numComment: { $size: "$comments" },
      },
    },
    {
      $lookup: {
        from: "post_likes",
        localField: "_id",
        foreignField: "postId",
        as: "likes",
      },
    },
    {
      $addFields: {
        numLike: { $size: "$likes" },
      },
    },
    {
      $lookup: {
        from: "post_shares",
        localField: "_id",
        foreignField: "postId",
        as: "shares",
      },
    },
    {
      $addFields: {
        numShare: { $size: "$shares" },
      },
    },
    {
      $lookup: {
        from: "post_likes",
        localField: "_id",
        foreignField: "postId",
        as: "listLiked",
        pipeline: [
          {
            $match: {
              studentAccountId: new mongoose.Types.ObjectId(accountId),
            },
          },
        ],
      },
    },
    {
      $addFields: {
        liked: {
          $cond: {
            if: { $gt: [{ $size: "$listLiked" }, 0] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        comments: 0,
        likes: 0,
        shares: 0,
        listLiked: 0,
      },
    },
    { $skip: skip },
    { $limit: limit },
  ];

  var post = await postModel.aggregate(pipeline);

  const totalPost = await postModel.countDocuments();
  const remainingPost = totalPost - page * limit;
  const hasMore = remainingPost > 0;

  return { post, hasMore };
};

const getAllPost = async () => {
  return await postModel.find();
};

module.exports = {
  getListPost,
  getAllPost,
};
