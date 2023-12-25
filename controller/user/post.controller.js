const mongoose = require("mongoose");
var Post = require("../../models/postModel");
var likeModel = require("../../models/postLikesModel");
var postService = require("../../service/user/postService");
var accountService = require("../../service/user/accountService");
var postLikeService = require("../../service/user/postLikeService");
const mime = require("mime-types");
const moment = require("moment");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

const listPost = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const accountId = req.query.accountId;
    console.log(`[listPost] id -> ${accountId}`);
    var filter = { isPublic: true };
    const { post, hasMore } = await postService.getListPost(
      limit,
      page,
      filter,
      accountId
    );

    console.log(`[listPost] Post: ${post}`);

    res.status(200).json({
      success: true,
      data: {
        listPost: post,
        hasMore: hasMore,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const myListPost = async (req, res) => {
  try {
    const { accountId } = req.params;
    const account = await accountService.findAccountById(accountId);
    if (!account) {
      res.status(400).json({
        success: false,
        message: "Tài khoản không tồn tại",
      });
    }
    const posts = await postService.getMyListPost(accountId);

    console.log(`[myListPost] Post: ${posts}`);

    res.status(200).json({
      success: true,
      data: {
        listPost: posts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { postId, accountId } = req.params;

    const detailPost = await postService.getDetailPost({
      _id: new mongoose.Types.ObjectId(postId),
    });

    if (!detailPost) {
      return res.status(400).json({
        success: false,
        message: "Bài viết không tồn tại",
      });
    }

    const account = await accountService.findAccountById(accountId);
    if (!account) {
      return res.status(400).json({
        success: false,
        message: "Tài khoản không tồn tại",
      });
    }

    if (
      !(detailPost.studentAccountId == accountId || account.role == "ADMIN")
    ) {
      return res.status(400).json({
        success: false,
        message: "Bạn không có quyền xóa bài viết này.",
      });
    }

    await postService.deletePostById(postId);

    res.status(200).json({
      success: true,
      message: "Xóa bài viết thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = req.body;
    const files = req.files;
    const baseUrl = req.protocol + "://" + req.get("host") + "/";

    const detailPost = await postService.getDetailPost({
      _id: new mongoose.Types.ObjectId(postId),
    });

    if (!detailPost) {
      res.status(400).json({
        success: false,
        message: "Bài viết không tồn tại",
      });
    }

    if (!post.content && (!files || !post.files)) {
      return res.status(301).json({
        success: false,
        message: "content or file is not empty",
      });
    }

    if (files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        const url = `${baseUrl}${files[i].destination}${files[i].filename}`;
        const mediaFile = {
          type: mime.lookup(url).split("/")[0],
          url: url,
        };
        post.files.push(mediaFile);
      }
    }
    await postService.updatePostById(postId, post);

    res.status(200).json({
      success: true,
      message: "Cập nhật bài viết thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const createPost = async (req, res) => {
  try {
    const baseUrl = req.protocol + "://" + req.get("host") + "/";
    const { studentAccountId } = req.query;
    const { content, isPublic } = req.body;
    const files = req.files;

    console.log("studentAccountId : ", studentAccountId);
    const post = new Post({
      studentAccountId,
      isPublic,
    });

    if (!content && !files) {
      return res.status(301).json({
        success: false,
        message: "content or file not found",
      });
    }

    if (files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        const url = `${baseUrl}${files[i].destination}${files[i].filename}`;
        const type = mime.lookup(url).split("/")[0];
        const mediaFile = {
          type: type,
          url: url,
        };
        if (type == "video") {
          const urlImageFromVideo = await takeScreenshotsAsync(files[i]);
          if (urlImageFromVideo) {
            mediaFile.imageShowVideo = `${baseUrl}${urlImageFromVideo}`;
          }
        }
        post.files.push(mediaFile);
      }
    }
    if (content) {
      post.content = content;
    }
    let date = new Date();
    post.date = moment(date);

    const savePost = await post.save();

    const detailPost = await postService.getDetailPost({
      _id: new mongoose.Types.ObjectId(savePost._id),
    });

    res.status(200).json({
      success: true,
      message: "Post created successfully",
      data: {
        savePost: detailPost,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create post",
      error: err.message,
    });
  }
};

function takeScreenshotsAsync(file) {
  const newFileImage =
    file.filename.substring(0, file.filename.lastIndexOf(".")) + ".jpg";
  return new Promise((resolve, reject) => {
    ffmpeg({ source: file.path })
      .takeScreenshots(
        { filename: newFileImage, timemarks: [2] },
        file.destination
      )
      .on("end", function () {
        resolve(file.destination + newFileImage);
      })
      .on("error", function (err) {
        console.error(err);
        reject(err);
      });
  });
}

const likePost = async (req, res) => {
  try {
    const { accountId, postId } = req.body;

    const detailPost = await postService.getDetailPost({
      _id: new mongoose.Types.ObjectId(postId),
    });

    if (!detailPost) {
      res.status(400).json({
        success: false,
        message: "Bài viết không tồn tại",
      });
    }

    const account = await accountService.findAccountById(accountId);
    if (!account) {
      res.status(400).json({
        success: false,
        message: "Tài khoản không tồn tại",
      });
    }

    const listLike = await postLikeService.findLikeList({
      studentAccountId: new mongoose.Types.ObjectId(accountId),
      postId: new mongoose.Types.ObjectId(postId),
    });

    if (listLike.length == 0) {
      const newLike = new likeModel({
        studentAccountId: new mongoose.Types.ObjectId(accountId),
        postId: new mongoose.Types.ObjectId(postId),
      });
      await newLike.save();
    } else {
      for (var i = 0; i < listLike.length; i++) {
        await postLikeService.deleteLike(listLike[i]._id);
      }
    }

    res.status(200).json({
      success: true,
      message: "Like bài viết thành công",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to like post",
      error: err.message,
    });
  }
};

module.exports = {
  listPost,
  createPost,
  myListPost,
  deletePost,
  updatePost,
  likePost,
};
