const mongoose = require("mongoose");
const profileModel = require("../../models/profileModel");

const findAccountDetailByID = async (accountId) => {
  try {
    const pipeline = [
      {
        $match: { accountId: new mongoose.Types.ObjectId(accountId) },
      },
      {
        $lookup: {
          from: "account",
          localField: "accountId",
          foreignField: "_id",
          as: "account",
          pipeline: [
            {
              $project: {
                _id: 1,
                email: 1,
                phoneNumber: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$account",
          preserveNullAndEmptyArrays: false,
        },
      },
    ];

    var profiles = await profileModel.aggregate(pipeline);
    if (profiles.length != 1) {
      return null;
    }
    return profiles[0];
  } catch (error) {
    console.error(error);
  }
};

const updateProfile = async (profileID, newInfomation) => {
  return await profileModel.findByIdAndUpdate(profileID, newInfomation);
};

const getProfile = async (filter) => {
  return await profileModel.findOne(filter);
};

module.exports = {
  findAccountDetailByID,
  updateProfile,
  getProfile
};