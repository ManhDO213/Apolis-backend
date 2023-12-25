var express = require("express");
var router = express.Router();
const courseRouter = require("./course/course");
const teacherRouter = require("./teacher/teacher");
const studentRouter = require("./student/student");
const postRouter = require("./post/post");
const revenueRouter = require("./revenue/revenue");
var checkPermission = require("../../middleware/permission");
var revenueController = require("../../controller/admin/revenue/revenueStatistics");

router.use("/course", courseRouter);

router.use("/teacher", teacherRouter);

router.use("/student", studentRouter);

router.use("/post", postRouter);

router.use("/revenue", revenueRouter);

router.use("/", checkPermission.checkRole(["ADMIN"]), revenueController.listRevenueDashboard);

module.exports = router;
