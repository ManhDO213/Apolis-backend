var commentModel = require("../../models/postCommentsModel");
const mongoose = require("mongoose");

const findAllComment = async (filter) => {
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
        from: "posts",
        localField: "postId",
        foreignField: "_id",
        as: "posts",
      },
    },
    {
      $unwind: {
        path: "$posts",
        preserveNullAndEmptyArrays: false,
      },
    },
  ];
  return commentModel.aggregate(pipeline);
};

module.exports = {
  findAllComment,
};