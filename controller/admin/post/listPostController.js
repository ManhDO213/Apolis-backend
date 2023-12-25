const mongoose = require("mongoose");
var postService = require("../../../service/user/postService");

const listPost = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const accountId = req.query.accountId;
    console.log(`[listPost] Id -> ${accountId}`);
    var filter = { isPublic: true };

    const { post, hasMore } = await postService.getListPost(
      limit,
      page,
      filter,
      accountId
    );
    console.log(`[listPost] Post: ${post}`);
    res.render("./admin/index.ejs", {
      title: "Bài viết",
      routerName: "list-post",
      posts: post,
      info: req.session.userLogin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const listPostReport = async (req, res) => {
  try {
   
    res.render("./admin/index.ejs", {
      title: "Bài viết",
      routerName: "list-post-report",
      info: req.session.userLogin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

module.exports = {
  listPost,
  listPostReport
};
