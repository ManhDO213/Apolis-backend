var express = require("express");
var router = express.Router();
const accountRouter = require("../user/account/account");
const notificationRouter = require("../user/notification/notification");
const postRouter = require("../user/post/post");
const courseRouter = require("../user/course/course");
const profileRouter = require("../user/profile/profile");
const commentRouter = require("../user/post/postComment");
const paymentRouter = require("../user/payment/payment");

router.use("/account", accountRouter);
router.use("/notification", notificationRouter);
router.use("/post", postRouter);
router.use("/api/course", courseRouter);
router.use("/post-comment", commentRouter);
router.use("/api/profile", profileRouter);
router.use("/payment", paymentRouter);

module.exports = router;