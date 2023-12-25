const mongoose = require("mongoose");
var accountService = require("../../../service/admin/account/accountService");
var courseService = require("../../../service/admin/course/courseService");
var revenueService = require("../../../service/admin/revenue/revenueService");
var courseRegistrationService = require("../../../service/admin/course/course_registration");
var postService = require("../../../service/admin/post/postService");

const listRevenueStatistics = async (req, res) => {
  try {
    res.render("./admin/index.ejs", {
      title: "Thống kê",
      routerName: "revenue",
      info: req.session.userLogin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const listRevenueDashboard = async (req, res) => {
  try {
    const listUser = await accountService.findUserAccount("ACTIVE");
    const listCourse = await courseService.listCourse("APPROVED");
    const revenue = await revenueService.getRevenue();
    const listCourseRegister =
      await courseRegistrationService.getAllCourseRegister();
    const listCourseAll = await courseService.getAllCourse();
    const listPost = await postService.getAllPost();
    const listTeacher = await accountService.getAccountsWithRole("TEACHER");
    const listStudent = await accountService.getAccountsWithRole("STUDENT");
    const listComplete = await courseService.listCourse("COMPLETE");
    const listDoing = await courseService.listCourse("APPROVED");
    const listPending = await courseService.listCourse("PENDING");
    const listReject = await courseService.listCourse("REJECT");

    const activity = {
      numRegisterCourse: listCourseRegister.length,
      numCreateCourse: listCourseAll.length,
      numCreatePost: listPost.length,
    };

    const account = {
      numStudent: listStudent.length,
      numTeacher: listTeacher.length,
      numCourse: listCourseAll.length,
    };

    const course = {
      numCourseComplete: listComplete.length,
      numCourseDoing: listDoing.length,
      numCoursePending: listPending.length,
      numCourseReject: listReject.length,
    };

    console.log("activity: ", activity);

    res.render("./admin/index.ejs", {
      title: "Dashboard",
      routerName: "dashboard",
      info: req.session.userLogin,
      listUser: listUser.slice(0, 5),
      listCourse: listCourse.slice(0, 5),
      revenue: revenue,
      activity: activity,
      account: account,
      course: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

module.exports = {
  listRevenueStatistics,
  listRevenueDashboard,
};
