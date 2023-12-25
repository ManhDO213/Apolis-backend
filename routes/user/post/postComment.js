var express = require("express");
var router = express.Router();
const commentController = require("../../../controller/user/commentController");
const multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const fileConfig = `${file.fieldname}-${Date.now()}-${file.originalname}`
    cb(null, fileConfig)
  },
});
var upload = multer({ storage: storage });

router.get("/all-comment/:postId",commentController.getListComment);
router.post("/add-comment",upload.single('file'),commentController.addComment);


module.exports = router;