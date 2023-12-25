const mongoose = require("mongoose");
const accountService = require("../../../service/admin/account/accountService");
const courseService = require("../../../service/admin/course/courseService");
const cycleCourseService = require("../../../service/admin/course/cycleCourseService");
const documentService = require("../../../service/admin/course/documentService");
const quizService = require("../../../service/admin/course/quizesService");
const questionService = require("../../../service/admin/course/questionService");
const scheduleService = require("../../../service/admin/course/scheduleService");
const courseModel = require("../../../models/course/courseModel");
const cycleCoursesModel = require("../../../models/course/cycleCoursesModel");
const documentCourseModel = require("../../../models/course/documentCourse");
const quizzesCourseModel = require("../../../models/course/quizzesCourse");
const quizzQuestionModel = require("../../../models/course/quizzQuestion");
const scheduleCourseModel = require("../../../models/course/scheduleCourse");
const moment1 = require("moment");

const listCourse = async (req, res) => {
  try {
    console.log("reqest teacher -> ", req.session.userLogin._id);
    const teacherAccountId = req.session.userLogin._id;
    const listCourse = await courseService.findCourseByMyTeacher(teacherAccountId,"APPROVED");
    console.log("[listCourse] list -> ", listCourse);

    res.render("./teacher/index.ejs", {
      title: "Khóa học của tôi",
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

const home = async (req, res) => {
  try {
    const listUser = await accountService.findUserAccount("ACTIVE");
    const listCourse = await courseService.listCourse("APPROVED");
    console.log("listCourse: ", listCourse);
    res.render("./teacher/index.ejs", {
      title: "Dashboard",
      routerName: "dashboard",
      info: req.session.userLogin,
      listUser: listUser.slice(0, 5),
      listCourse: listCourse.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const getCourseById = async (req, res) => {
  try {
    res.render("./teacher/course/detailCourse.ejs");
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

    res.render("./teacher/index.ejs", {
      title: "Chi tiết khóa học",
      routerName: "detail-course",
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

const addCourseTeacher = async (req, res) => {
  try {
    const listCategory = ["Listening", "Speaking", "Reading", "Writing"];
    
    console.log(
      `[CourseController] addCourseTeacher -> ${JSON.stringify(req.session.userLogin)}`
    ); 

    res.render("./teacher/index.ejs", {
      title: "Thêm khóa học",
      routerName: "add-course",
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
      videoUrls : data.videoUrls
    });

    course.photoUrls = [];
    for (var i = 0; i < files.mediaCourse.length; i++) {
      const url = `${baseUrl}${files.mediaCourse[i].destination}${files.mediaCourse[i].filename}`;
      course.photoUrls.push(url);
    }
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
      status: "PENDING",
      isCompleted: false,
    });

    await cycleCourses.save({ session });

    var documents = [];
    var schedulesCourse = [];
    for (var i = 0; i < data.schedule.length; i++) {
      documents.push({
        teacherAccountId: new mongoose.Types.ObjectId(data.teacherAccountId),
        courseId: new mongoose.Types.ObjectId(newCourse._id),
        session: i + 1,
        documents: [
          {
            title: data.schedule[i].title,
            description: data.schedule[i].description,
            url: data.schedule[i].url,
            duration: 180,
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
  const formattedDate = moment1(dateFomat)
    .tz(timeZone)
    .format("MM/DD/YYYY HH:mm:ss z");
  return formattedDate;
}

const editCourseTeacher = async (req, res) => {
  try {
    const listCategory = ["Listening", "Speaking", "Reading", "Writing"];
    console.log(
      `[editCourseTeacher] addCourseTeacher -> ${JSON.stringify(req.session.userLogin)}`
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

    res.render("./teacher/index.ejs", {
      title: "Sửa khóa học",
      routerName: "edit-course",
      info: req.session.userLogin,
      listCategory: listCategory,
      course: course,
      moment: moment1
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

module.exports = {
  listCourse,
  home,
  getCourseById,
  addCourseTeacher,
  detailCourse,
  postCourse,
  editCourseTeacher
};
