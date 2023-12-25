var likeModel = require("../../models/postLikesModel");

const findLikeList = async (filter) => {
  return likeModel.find(filter);
};

const deleteLike = async (id) => {
  return likeModel.findByIdAndDelete(id);
};

module.exports = {
  findLikeList,
  deleteLike,
};