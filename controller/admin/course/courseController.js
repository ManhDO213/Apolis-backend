const mongoose = require("mongoose");
const moment = require("moment-timezone");
const { getVideoDurationInSeconds } = require("get-video-duration");
const accountService = require("../../../service/admin/account/accountService");
const courseService = require("../../../service/admin/course/courseService");
const assigmentService = require("../../../service/admin/assigment/assigmentService");
const courseModel = require("../../../models/course/courseModel");
const attendanceService = require("../../../service/admin/attendance/attendanceService");
const cycleCoursesModel = require("../../../models/course/cycleCoursesModel");
const documentCourseModel = require("../../../models/course/documentCourse");
const quizzesCourseModel = require("../../../models/course/quizzesCourse");
const quizzQuestionModel = require("../../../models/course/quizzQuestion");
const scheduleCourseModel = require("../../../models/course/scheduleCourse");
const attendanceModel = require("../../../models/attendanceScheduleModel");
const questionAsigmentModel = require("../../../models/course/questionAssignmentModel");

const moment1 = require("moment");

const listCourse = async (req, res) => {
  try {
    const listCourse = await courseService.listCourse("APPROVED");
    console.log("listCourse: ", listCourse);

    res.render("./admin/index.ejs", {
      title: "Khóa học",
      routerName: "course",
      info: req.session.userLogin,
      listCourseData: listCourse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const detailCourse = async (req, res) => {
  try {
    let idCourse = req.params.idCourse;
    const course = await courseService.findCourseByID2(idCourse);
    console.log(`[detailCourse] course -> ${JSON.stringify(course)}`);

    if (!course) {
      return res.status(301).json({
        success: false,
        message: `Courses not found`,
      });
    }

    res.render("./admin/index.ejs", {
      title: "Chi tiết khóa học",
      routerName: "detailCourse",
      info: req.session.userLogin,
      course: course,
      moment: moment1,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const listApproveCourse = async (req, res) => {
  try {
    console.log("request -> ", req.query.status);
    var status = "PENDING";
    if (req.query.status) {
      status = req.query.status;
    }
    const courses = await courseService.listCourse(status);
    console.log(`[listApproveCourse] course -> ${JSON.stringify(courses)}`);
    res.render("./admin/index.ejs", {
      title: "Phê duyệt khóa học",
      info: req.session.userLogin,
      listCourseData: courses,
      routerName: "list-approve-course",
      status: status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const approveCourse = async (req, res) => {
  try {
    let idCourse = req.params.idCourse;
    console.log("[approveCourse] courseId => ", idCourse);
    const approveCourse = await courseService.isApprovedCourse(idCourse);
    console.log(`[approveCourse] approveCourse -> ${approveCourse}`);
    res.redirect("/admin/course/list-approve-course");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const rejectCourse = async (req, res) => {
  try {
    let idCourse = req.params.idCourse;
    console.log("courseId => ", idCourse);
    const lockReason = req.body.lockReason;
    const approveCourse = await courseService.rejectCourse(
      idCourse,
      lockReason
    );
    console.log(`approveCourse -> ${approveCourse}`);
    res.status(200).json({
      success: true,
      message: `Khóa thành công !`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const detailApproveCourse = async (req, res) => {
  try {
    let idCourse = req.params.idCourse;
    const course = await courseService.findCourseByID3(idCourse);
    console.log(`[detailCourse] course -> ${course}`);

    if (!course) {
      return res.status(301).json({
        success: false,
        message: `Courses not found`,
      });
    }

    res.render("./admin/course/detailCourse.ejs", {
      courses: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const statisticalCourse = async (req, res) => {
  try {
    const listCourse = await courseService.listCourse("APPROVED");
    // res.render("admin\\course\\statisticalCourse.ejs", { title: "Express" });
    res.render("./admin/course/listCourse.ejs", {
      listCourseData: listCourse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const deleteCourse = async (req, res) => {
  try {
    let idCourse = req.params.idCourse;
    const courses = await courseService.deleteCourse(idCourse);
    console.log("listCourse: ", courses);
    res.redirect("/admin/course/list-course");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const addCourseAdmin = async (req, res) => {
  try {
    const listCategory = ["Listening", "Speaking", "Reading", "Writing"];
    const listTeacher = await accountService.getTeacherAccounts("ACTIVE");
    console.log(
      `[CourseController] addCourseAdmin -> listTeacher: ${listTeacher}`
    );
    res.render("./admin/index.ejs", {
      title: "Thêm khóa học",
      routerName: "add-course",
      info: req.session.userLogin,
      listTeacher: listTeacher,
      listCategory: listCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const editCourseAdmin = async (req, res) => {
  try {
    const listCategory = ["Listening", "Speaking", "Reading", "Writing"];
    console.log(
      `[editCourseTeacher] addCourseTeacher -> ${JSON.stringify(
        req.session.userLogin
      )}`
    );
    let idCourse = req.params.idCourse;
    const course = await courseService.findCourseByID2(idCourse);
    console.log(`[editCourseTeacher] course -> ${JSON.stringify(course)}`);

    if (!course) {
      return res.status(301).json({
        success: false,
        message: `Courses not found`,
      });
    }
    res.render("./admin/index.ejs", {
      title: "Sửa khóa học",
      routerName: "edit-course",
      info: req.session.userLogin,
      listCategory: listCategory,
      course: course,
      moment: moment1,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const postCourse = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const baseUrl = req.protocol + "://" + req.get("host") + "/";
    const files = req.files;
    const data = JSON.parse(req.body.data);
    console.log("postCourse file: ", files);
    console.log("postCourse data: ", data);

    var requiredFields = [
      "teacherAccountId",
      "name",
      "category",
      "totalSession",
      "feeCoin",
      "description",
      "googleMeetUrl",
      "minStudent",
      "maxStudent",
      "registrationPeriod",
      "startDate",
      "endDate",
      "schedule",
      "quizs",
    ];
    var missingFields = [];

    requiredFields.forEach(function (field) {
      if (data[field] === null) {
        missingFields.push(field);
      }
    });

    if (missingFields.length != 0) {
      var errorMessage = "Thiếu các trường sau: " + missingFields.join(", ");
      return res.status(301).json({
        success: false,
        message: errorMessage,
      });
    }

    var prefixCourseName = "";
    var numRandom = getRandomDigits();
    if (data.category.toUpperCase() == "LISTENING") {
      prefixCourseName = `[LS${numRandom}]`;
    } else if (data.category.toUpperCase() == "SPEAKING") {
      prefixCourseName = `[SP${numRandom}]`;
    } else if (data.category.toUpperCase() == "READING") {
      prefixCourseName = `[RD${numRandom}]`;
    } else if (data.category.toUpperCase() == "WRITING") {
      prefixCourseName = `[WR${numRandom}]`;
    } else {
      prefixCourseName = `[OT${numRandom}]`;
    }

    const course = new courseModel({
      teacherAccountId: new mongoose.Types.ObjectId(data.teacherAccountId),
      name: `${prefixCourseName} ${data.name}`,
      description: data.description,
      category: data.category,
      totalSession: data.totalSession,
      feeCoin: data.feeCoin,
      discount: data.discount,
    });

    course.photoUrls = [];
    for (var i = 0; i < files.mediaCourse.length; i++) {
      const url = `${baseUrl}${files.mediaCourse[i].destination}${files.mediaCourse[i].filename}`;
      course.photoUrls.push(url);
    }
    const urlVideo = `${baseUrl}${files.mediaVideoCourse[0].destination}${files.mediaVideoCourse[0].filename}`;
    course.videoUrls = urlVideo;

    const newCourse = await course.save({ session });

    const cycleCourses = new cycleCoursesModel({
      teacherAccountId: new mongoose.Types.ObjectId(data.teacherAccountId),
      courseId: new mongoose.Types.ObjectId(newCourse._id),
      googleMeetUrl: data.googleMeetUrl,
      minStudent: data.minStudent,
      maxStudent: data.maxStudent,
      registrationPeriod: {
        startDate: formatDateWithTimeZone(
          data.registrationPeriod.startDate,
          data.timeZone
        ),
        endDate: formatDateWithTimeZone(
          data.registrationPeriod.endDate,
          data.timeZone
        ),
      },
      startDate: formatDateWithTimeZone(data.startDate, data.timeZone),
      endDate: formatDateWithTimeZone(data.endDate, data.timeZone),
      status: "APPROVED",
      isCompleted: false,
    });

    await cycleCourses.save({ session });

    var documents = [];
    var schedulesCourse = [];
    for (var i = 0; i < data.schedule.length; i++) {
      const urlVideo = `${baseUrl}${files.scheduleVideoFile[i].destination}${files.scheduleVideoFile[i].filename}`;

      const durationVideo = await getVideoDurationInSeconds(urlVideo);
      documents.push({
        teacherAccountId: new mongoose.Types.ObjectId(data.teacherAccountId),
        courseId: new mongoose.Types.ObjectId(newCourse._id),
        session: i + 1,
        documents: [
          {
            title: data.schedule[i].title,
            description: data.schedule[i].description,
            url: urlVideo,
            duration: durationVideo,
          },
        ],
      });

      schedulesCourse.push({
        teacherAccountId: new mongoose.Types.ObjectId(data.teacherAccountId),
        courseId: new mongoose.Types.ObjectId(newCourse._id),
        session: i + 1,
        startDate: formatDateWithTimeZone(
          data.schedule[i].startTime,
          data.timeZone
        ),
        endDate: formatDateWithTimeZone(
          data.schedule[i].endTime,
          data.timeZone
        ),
        description: data.schedule[i].title,
      });
    }

    await documentCourseModel
      .insertMany(documents, { session: session })
      .then(() => {})
      .catch((err) => {
        session.abortTransaction();
        console.error("Lỗi chèn dữ liệu:", err);
        session.endSession();
      });

    var quizCourse = [];
    for (var i = 0; i < data.quizs.length; i++) {
      quizCourse.push({
        teacherAccountId: new mongoose.Types.ObjectId(data.teacherAccountId),
        courseId: new mongoose.Types.ObjectId(newCourse._id),
        session: i + 1,
        endDurationSeconds: 30 * 60,
      });
    }

    var quizQuestion = [];
    await quizzesCourseModel
      .insertMany(quizCourse, { session: session })
      .then((insertedDocuments) => {
        for (var i = 0; i < insertedDocuments.length; i++) {
          for (var j = 0; j < data.quizs[i].length; j++) {
            var answersQuiz = [];
            for (var z = 0; z < data.quizs[i][j].answers.length; z++) {
              answersQuiz.push({
                value: data.quizs[i][j].answers[z],
                isCorrect: data.quizs[i][j].correctIndex == z,
              });
            }
            quizQuestion.push({
              teacherAccountId: new mongoose.Types.ObjectId(
                data.teacherAccountId
              ),
              courseQuizId: new mongoose.Types.ObjectId(
                insertedDocuments[i]._id
              ),
              question: data.quizs[i][j].question,
              answers: answersQuiz,
            });
          }
        }
      })
      .catch((err) => {
        session.abortTransaction();
        console.error("Lỗi chèn dữ liệu:", err);
        session.endSession();
      });

    await quizzQuestionModel
      .insertMany(quizQuestion, { session: session })
      .then(() => {})
      .catch((err) => {
        session.abortTransaction();
        console.error("Lỗi chèn dữ liệu:", err);
        session.endSession();
      });

    await scheduleCourseModel
      .insertMany(schedulesCourse, { session: session })
      .then(() => {})
      .catch((err) => {
        session.abortTransaction();
        console.error("Lỗi chèn dữ liệu:", err);
        session.endSession();
      });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: `Tạo khóa học thành công`,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

function getRandomDigits() {
  const min = Math.pow(10, 6 - 1);
  const max = Math.pow(10, 6) - 1;
  return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
}

function formatDateWithTimeZone(date, timeZone) {
  const dateFomat = new Date(date);
  const formattedDate = moment(dateFomat)
    .tz(timeZone)
    .format("MM/DD/YYYY HH:mm:ss z");
  return formattedDate;
}

const scoreBoardCourse = async (req, res) => {
  try {
    res.render("./admin/index.ejs", {
      title: "Bảng điểm",
      routerName: "scoreBoard",
      info: req.session.userLogin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const attendanceCourse = async (req, res) => {
  try {
    let idCourse = req.params.idCourse;
    let idSchedule = req.params.idSchedule;
    console.log(`[attendance] idSchedule -> ${idSchedule}`);
    const listStudent = await courseService.findStudentByCourse(idCourse);
    console.log(`[attendance] list student -> ${JSON.stringify(listStudent)}`);
    const listAttendance = await attendanceService.findAttendanceBySchedule(
      idSchedule
    );
    console.log(
      `[attendance] list Attendance -> ${JSON.stringify(listAttendance)}`
    );

    for (var i = 0; i < listStudent.length; i++) {
      var isPresent = false;
      for (var j = 0; j < listAttendance.length; j++) {
        if (
          listStudent[i].accountId.toString() ==
          listAttendance[j].studentAccountId.toString()
        ) {
          isPresent = listAttendance[j].isPresent;
        }
      }
      listStudent[i].isPresent = isPresent;
    }

    res.render("./admin/index.ejs", {
      title: "Điểm danh",
      routerName: "attendanceCourse",
      info: req.session.userLogin,
      listStudent: listStudent,
      idSchedule: idSchedule,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const postAttendance = async (req, res) => {
  try {
    const data = req.body; // Không cần phải parse JSON, vì dữ liệu đã được gửi dưới dạng JSON

    var listAttendance = await attendanceService.findAttendanceBySchedule(
      data[0].scheduleId
    );
    console.log("listAttendance: ", listAttendance);
    var newAttendanceList = [];
    var updateAttendanceList = [];
    for (var i = 0; i < data.length; i++) {
      // Thay đổi data.attendance thành data
      const studentAccountId = data[i].studentAccountId;
      const scheduleId = data[i].scheduleId;
      const isPresent = data[i].isPresent;
      var isHave = false;
      var attendance;
      for (var j = 0; j < listAttendance.length; j++) {
        if (studentAccountId == listAttendance[j].studentAccountId) {
          isHave = true;
          attendance = listAttendance[j];
        }
      }

      if (isHave) {
        attendance.isPresent = isPresent;
        updateAttendanceList.push(attendance);
      } else {
        const scheduleObj = {
          scheduleId: scheduleId,
          studentAccountId: studentAccountId,
          isPresent: isPresent,
        };
        newAttendanceList.push(scheduleObj);
      }
    }

    await attendanceModel.insertMany(newAttendanceList);

    for (var i = 0; i < updateAttendanceList.length; i++) {
      await attendanceService.findAttendanceAndUpdate(
        updateAttendanceList[i]._id,
        updateAttendanceList[i]
      );
    }

    return res.status(200).json({
      success: true,
      message: "Điểm danh thành công!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const listCategory = async (req, res) => {
  try {
    const listCategory = await assigmentService.listCategoryAssigment();
    console.log(
      `[listAssigment] listCategory -> listCategory: ${listCategory}`
    );
    res.render("./admin/index.ejs", {
      title: "Assigment",
      routerName: "listCategory",
      info: req.session.userLogin,
      listCategory: listCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const listAssigment = async (req, res) => {
  try {
    let assignmentId = req.params.assignmentId;
    console.log(
      `[listAssigment] assignmentId: ${assignmentId}`
    );
    const listAssigment = await assigmentService.listAssigment(assignmentId);
    console.log(
      `[listAssigment] listAssigment: ${listAssigment}`
    );
    res.render("./admin/index.ejs", {
      title: "Assigment",
      routerName: "listAssigment",
      info: req.session.userLogin,
      listAssigment: listAssigment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const addAssigment = async (req, res) => {
  try {
    const listCategory = ["Listening", "Speaking", "Reading", "Writing"];
    const listTeacher = await accountService.getTeacherAccounts("ACTIVE");
    let assignmentId = req.params.assignmentId;
    console.log(
      `[CourseController] addCourseAdmin -> listTeacher: ${listTeacher}`
    );
    res.render("./admin/index.ejs", {
      title: "Assigment",
      routerName: "addAssigment",
      info: req.session.userLogin,
      listTeacher: listTeacher,
      listCategory: listCategory,
      assignmentId: assignmentId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const postQuestionAssigment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const baseUrl = req.protocol + "://" + req.get("host") + "/";
    const files = req.files;
    const data = JSON.parse(req.body.data);

    console.log("[postQuestionAssigment] file: ", files);
    console.log("[postQuestionAssigment] data: ", data);

    var quizQuestion = [];
    for (var i = 0; i < data.questions.length; i++) {
      quizQuestion.push({
        assignmentId: new mongoose.Types.ObjectId(data.assignmentId),
        question: data.questions[i].question,
        answers: data.questions[i].answers,
      });
    }
    console.log(
      `[postAssigment] quizQuestion -> ${JSON.stringify(quizQuestion)}`
    );
    await questionAsigmentModel
      .insertMany(quizQuestion, { session: session })
      .then(() => {})
      .catch((err) => {
        session.abortTransaction();
        console.error("Lỗi chèn dữ liệu:", err);
        session.endSession();
      });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: `Tạo assigment thành công`,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

module.exports = {
  listCourse,
  deleteCourse,
  statisticalCourse,
  approveCourse,
  listApproveCourse,
  detailCourse,
  postCourse,
  addCourseAdmin,
  rejectCourse,
  detailApproveCourse,
  editCourseAdmin,
  scoreBoardCourse,
  attendanceCourse,
  postAttendance,
  listCategory,
  listAssigment,
  addAssigment,
  postQuestionAssigment,
};
