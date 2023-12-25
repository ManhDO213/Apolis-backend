var express = require("express");
var router = express.Router();
var CheckPermission = require("../../../middleware/permission");
const managePost = require("../../../controller/admin/post/listPostController");

router.get("/list-post", CheckPermission.checkRole(["ADMIN"]), managePost.listPost);

router.get(
  "/list-post-report",
  CheckPermission.checkRole(["ADMIN"]),
  managePost.listPostReport
);

module.exports = router;
