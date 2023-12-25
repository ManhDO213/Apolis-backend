var express = require("express");
var router = express.Router();
const postController = require("../../../controller/user/post.controller");
const multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const fileConfig = `${file.fieldname}-${Date.now()}-${file.originalname}`;
    cb(null, fileConfig);
  },
});
var upload = multer({ storage: storage });

router.get("/all-post", postController.listPost);
router.get("/my-all-post/:accountId", postController.myListPost);
router.delete("/delete-post/:postId/:accountId", postController.deletePost);
router.post("/new-post", upload.array("files"), postController.createPost);
router.post(
  "/update-post/:postId",
  upload.array("files"),
  postController.updatePost
);
router.post("/like-post/", postController.likePost);

module.exports = router;