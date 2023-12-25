var express = require("express");
var router = express.Router();
const courseController = require("../../../controller/user/courseController");

router.get("/all-course", courseController.getListCourse);

router.get("/all-course-with-filter", courseController.getCoursesWithFilter);

router.get("/all-course-with-query", courseController.getCoursesWithQuery);

router.get("/all-course-category", courseController.getCourseCategory);

router.get("/find-course-by-id/:idCourse", courseController.getCourseDetail);

router.get("/get-schedule-by-id", courseController.getListScheduleWithDay);

router.get("/get-quiz-by-student", courseController.getQuizStudent);

router.get("/get-result-of-student", courseController.getResultQuizOfStudent);

router.post(
  "/complete-quiz-by-student",
  courseController.completeQuizByStudent
);

router.post(
  "/complete-assignment-by-student",
  courseController.completeAssignmentByStudent
);

router.post(
  "/register-free-course/:idCourse/:accountId",
  courseController.registerFreeCourse
);

router.get(
  "/get-assignment-by-student/:assignmentId/:accountId",
  courseController.getResultAssignmentOfStudent
);

router.get(
  "/find-detail-my-course/:idCourse/:accountId",
  courseController.getMyCourseDetail
);

router.get("/filter-course-by-feecoin", courseController.filteredCourses);

router.get(
  "/check-status-course/:idCourse/:accountId",
  courseController.checkStatusCourse
);

router.get("/get-course-register/:accountId", courseController.listMyCourses);

module.exports = router;
