var express = require("express");
var router = express.Router();
var checkPermission = require("../../middleware/permission");
var courseWebControler = require("../../controller/teacher/course/courseController");
var studentWebControler = require("../../controller/teacher/student/studentController");
var scheduleWebController = require("../../controller/teacher/schedule/scheduleController");
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

// Manage - course
router.get("/course/detail-course/:idCourse",checkPermission.checkRole(["TEACHER"]), courseWebControler.detailCourse);
router.get("/course/list-course", checkPermission.checkRole(["TEACHER"]), courseWebControler.listCourse);
router.get("/course/add-course", checkPermission.checkRole(["TEACHER"]), courseWebControler.addCourseTeacher);
router.post(
    "/course/add-course",
    checkPermission.checkRole(["TEACHER"]),
    upload.fields([
      { name: "mediaCourse" },
      { name: "scheduleDocumentFile" },
      { name: "arraysQuizFile" },
    ]),
    courseWebControler.postCourse
  );
  router.get("/course/edit-course/:idCourse", checkPermission.checkRole(["TEACHER"]), courseWebControler.editCourseTeacher);

// Manage - student
router.get("/student/courseAttendance", checkPermission.checkRole(["TEACHER"]), studentWebControler.courseAttendance);
router.get("/student/attendance/:idCourse/:idSchedule", checkPermission.checkRole(["TEACHER"]), studentWebControler.attendance);
router.post("/student/attendance-student", checkPermission.checkRole(["TEACHER"]), studentWebControler.postAttendance);
router.get("/student/my-course", checkPermission.checkRole(["TEACHER"]), studentWebControler.listCourse);
router.get("/student/my-student", checkPermission.checkRole(["TEACHER"]), studentWebControler.listStudent);
router.get("/student/poin-student-1", checkPermission.checkRole(["TEACHER"]), studentWebControler.poinStudent1);
router.get("/student/score-board", checkPermission.checkRole(["TEACHER"]), studentWebControler.poinStudent2);

// Manage - profile
router.get("/detail-profile/:idAccount",checkPermission.checkRole(["TEACHER"]), studentWebControler.detailTeacher);
router.get("/edit-profile/:idAccount",checkPermission.checkRole(["TEACHER"]), studentWebControler.editTeacher);

// Manage - schedule
router.get("/schedule/listSchedule/:idAccount",checkPermission.checkRole(["TEACHER"]), scheduleWebController.listSchedule);


module.exports = router;
