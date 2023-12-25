const mongoose = require("mongoose");
const mime = require('mime-types');
const commentService = require("../../service/user/postCommentService");
const commentModel = require("../../models/postCommentsModel");

const getListComment = async (req, res) => {
  try {
    const postId = req.params.postId;

    const comment = await commentService.findAllComment({
      postId: new mongoose.Types.ObjectId(postId),
    });

    if (!comment) {
      return res.status(301).json({
        success: false,
        message: "comment is undefined",
      });
    }

    console.log(`[getListComment] comment: -> ${comment}`);
    res.status(200).json({
      success: true,
      data: {
        listComment: comment,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const addComment = async (req, res) => {
  try {
    const baseUrl = req.protocol + "://" + req.get("host") + "/";
    const { studentAccountId, postId } = req.query;
    const { content } = req.body;
    const file = JSON.parse(req.body.file);
    const fileReceive = req.file;
    const comment = new commentModel({
      studentAccountId,
      postId,
      file,
    });

    if (!fileReceive && !content && file.length == 0) {
      return res.status(301).json({
        success: false,
        message: "file and content not found !",
      });
    }

    if (fileReceive) {
      const url = `${baseUrl}${fileReceive.destination}${fileReceive.filename}`;
      const mediaFile = {
        type: mime.lookup(url).split("/")[0],
        url: url,
      };
      comment.file = [mediaFile];
    }

    if (content) {
      comment.content = content;
    }
    console.log("comment: ", comment);
    const savedComment = await comment.save();
    const newComment = await commentService.findAllComment({
      _id: new mongoose.Types.ObjectId(savedComment._id),
    });
    res.status(200).json({
      success: true,
      message: `Add comment successfully !`,
      data: {
        savedComment: newComment[0],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

module.exports = {
  addComment,
  getListComment,
};