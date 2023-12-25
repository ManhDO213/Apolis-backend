var express = require("express");
var router = express.Router();
var CheckPermission = require("../../../middleware/permission");
const courseController = require("../../../controller/admin/course/courseController");
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

router.get(
  "/",
  CheckPermission.checkRole(["ADMIN"]),
  courseController.listCourse
);

router.get(
  "/detail-course/:idCourse",
  CheckPermission.checkRole(["ADMIN"]),
  courseController.detailCourse
);

router.get(
  "/list-approve-course",
  CheckPermission.checkRole(["ADMIN"]),
  courseController.listApproveCourse
);

router.post(
  "/approve-course/:idCourse",
  CheckPermission.checkRole(["ADMIN"]),
  courseController.approveCourse
);

router.post(
  "/reject-course/:idCourse",
  CheckPermission.checkRole(["ADMIN"]),
  courseController.rejectCourse
);

router.get(
  "/detail-approve-course/:idCourse",
  CheckPermission.checkRole(["ADMIN"]),
  courseController.detailApproveCourse
);

router.get(
  "/statistical",
  CheckPermission.checkRole(["ADMIN"]),
  courseController.statisticalCourse
);

router.get(
  "/delete-course/:idCourse",
  CheckPermission.checkRole(["ADMIN"]),
  courseController.deleteCourse
);

router.get(
  "/add-course",
  CheckPermission.checkRole(["ADMIN"]),
  courseController.addCourseAdmin
);

router.post(
  "/add-course",
  CheckPermission.checkRole(["ADMIN"]),
  upload.fields([
    { name: "mediaCourse" },
    { name: "mediaVideoCourse" },
    { name: "scheduleDocumentFile" },
    { name: "scheduleVideoFile" },
    { name: "arraysQuizFile" },
  ]),
  courseController.postCourse
);

router.get(
  "/edit-course/:idCourse",
  CheckPermission.checkRole(["ADMIN"]),
  courseController.editCourseAdmin
);

router.get(
  "/scoreBoard",
  CheckPermission.checkRole(["ADMIN"]),
  courseController.scoreBoardCourse
);

router.get(
  "/attendanceCourse/:idCourse/:idSchedule",
  CheckPermission.checkRole(["ADMIN"]),
  courseController.attendanceCourse
);

router.post("/attendance-student", CheckPermission.checkRole(["ADMIN"]), courseController.postAttendance);

router.get(
  "/listCategory",
  CheckPermission.checkRole(["ADMIN"]),
  courseController.listCategory
);

router.get(
  "/listAssigment/:assignmentId",
  CheckPermission.checkRole(["ADMIN"]),
  courseController.listAssigment
);

router.get(
  "/addAssigment/:assignmentId",
  CheckPermission.checkRole(["ADMIN"]),
  courseController.addAssigment
);

router.post(
  "/add-assigment",
  CheckPermission.checkRole(["ADMIN"]),
  upload.fields([
    { name: "arraysQuizFile" },
  ]),
  courseController.postQuestionAssigment
);

module.exports = router;
