const mongoose = require("mongoose");
const moment = require("moment");
const courseService = require("../../service/user/courseService");
const accountService = require("../../service/user/accountService");
const courseRegistrationService = require("../../service/user/courseRegistrationService");
const quizzScoresModel = require("../../models/course/quizzScoresModel");
const notificationModel = require("../../models/notificationModel");
const assignmentScoreModel = require("../../models/course/assignmentScoreModel");
const firsebase = require("../../modules/firsebase");

const getListCourse = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const page = parseInt(req.query.page) || 1;

    const courses = await courseService.getCourseList(limit, page, {}, false);
    const categories = await courseService.getCourseCategories();
    const saleCourses = await courseService.getCourseList(
      5,
      1,
      { discount: { $gt: 0 } },
      false
    );
    const popularCourses = await courseService.getCourseList(5, 1, {}, true);
    const freeCourses = await courseService.getCourseList(
      5,
      1,
      { feeCoin: { $lte: 0 } },
      false
    );

    console.log(`[getListCourse] Course: -> ${courses}`);
    console.log(`[getListCourse] categories: -> ${categories}`);
    console.log(`[getListCourse] saleCourses: -> ${saleCourses}`);
    console.log(`[getListCourse] popularCourses: -> ${popularCourses}`);
    res.status(200).json({
      success: true,
      data: {
        listCourse: courses,
        hasMore: false,
        categories: categories,
        saleCourses: saleCourses,
        popularCourses: popularCourses,
        freeCourses: freeCourses,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const getCourseCategory = async (req, res) => {
  try {
    const categories = await courseService.getCourseCategories();

    console.log(`[getCourseCategory] categories: -> ${categories}`);
    res.status(200).json({
      success: true,
      data: {
        categories: categories,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const getCoursesWithFilter = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const category = req.query.category;
    const popular = req.query.popular;
    const sale = req.query.sale;
    const free = req.query.free;
    var courses = [];

    if (category) {
      courses = await courseService.getCourseList(
        limit,
        page,
        { category: category },
        false
      );
    } else if (popular) {
      courses = await courseService.getCourseList(limit, page, {}, true);
    } else if (sale) {
      courses = await courseService.getCourseList(
        limit,
        page,
        { discount: { $gt: 0 } },
        false
      );
    } else if (free) {
      courses = await courseService.getCourseList(
        limit,
        page,
        { feeCoin: { $lte: 0 } },
        false
      );
    }

    console.log(`[getCoursesWithFilter] Course: -> ${courses}`);
    res.status(200).json({
      success: true,
      data: {
        listCourse: courses,
        hasMore: false,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const getCoursesWithQuery = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    var filter = {};
    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: "i" };
    }
    const courses = await courseService.getCourseList(
      limit,
      page,
      filter,
      false
    );

    console.log(`[getCoursesWithQuery] Course: -> ${courses}`);
    res.status(200).json({
      success: true,
      data: {
        listCourse: courses,
        hasMore: false,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const getCourseDetail = async (req, res) => {
  try {
    let idCourse = req.params.idCourse;
    const course = await courseService.findCourseByID(idCourse);
    console.log(`[getCourseDetail] Course: -> ${course}`);

    if (!course) {
      return res.status(301).json({
        success: false,
        message: `Courses not found`,
      });
    }

    const listUser = await accountService.getStudentAccounts({
      role: "STUDENT",
    });
    var evaluates = [];
    for (var i = 0; i < listUser.length; i++) {
      evaluates.push({
        content: "Giảng viên thân thiện",
        profile: listUser[i].profile,
      });
    }

    course.evaluates = evaluates.slice(0, 3);

    return res.status(200).json({
      success: true,
      data: { course: course },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const getMyCourseDetail = async (req, res) => {
  try {
    let { idCourse, accountId } = req.params;
    const course = await courseService.findDetailMyCourse(idCourse, accountId);
    console.log(`[getCourseDetail] Course: -> ${course}`);

    if (!course) {
      return res.status(301).json({
        success: false,
        message: `Courses not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: { course: course },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const filteredCourses = async (req, res) => {
  try {
    const { minFeeCoin, maxFeeCoin, name } = req.query;
    const courses = await courseService.filterCourse(
      minFeeCoin,
      maxFeeCoin,
      name
    );

    console.log(`[filteredCourses] Course: -> ${courses}`);

    if (!courses) {
      return res.status(301).json({
        success: false,
        message: `Courses not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: { courses: courses },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const checkStatusCourse = async (req, res) => {
  try {
    const { idCourse, accountId } = req.params;
    console.log("[CourseController] checkStatusCourse params ->", req.params);
    const course = await courseService.findCourseByID(idCourse);

    console.log(`[CourseController] checkStatusCourse: -> ${course}`);

    if (!course) {
      return res.status(301).json({
        success: false,
        message: `Courses not found`,
      });
    }

    const account = await accountService.findAccountById(accountId);

    if (!account) {
      return res.status(301).json({
        success: false,
        message: `Tài khoản không tồn tại`,
      });
    }

    const registerCourses = await courseRegistrationService.findRegisterCourse({
      studentAccountId: new mongoose.Types.ObjectId(accountId),
      courseId: new mongoose.Types.ObjectId(idCourse),
    });

    if (registerCourses.length >= 1) {
      return res.status(301).json({
        success: false,
        message: `Bạn đã đăng ký khóa học này.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Khóa học chưa được đăng ký.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const registerFreeCourse = async (req, res) => {
  try {
    const { idCourse, accountId } = req.params;
    console.log("[CourseController] checkStatusCourse params ->", req.params);
    const course = await courseService.findCourseByID(idCourse);

    console.log(`[CourseController] checkStatusCourse: -> ${course}`);

    if (!course) {
      return res.status(301).json({
        success: false,
        message: `Courses not found`,
      });
    }

    if (course.feeCoin > 0) {
      return res.status(301).json({
        success: false,
        message: `Khóa học cần tính phí`,
      });
    }

    const account = await accountService.findAccountById(accountId);

    if (!account) {
      return res.status(301).json({
        success: false,
        message: `Tài khoản không tồn tại`,
      });
    }

    const registerCourses = await courseRegistrationService.findRegisterCourse({
      studentAccountId: new mongoose.Types.ObjectId(accountId),
      courseId: new mongoose.Types.ObjectId(idCourse),
    });

    if (registerCourses.length >= 1) {
      return res.status(301).json({
        success: false,
        message: `Bạn đã đăng ký khóa học này.`,
      });
    }

    const courseRegistration = await courseRegistrationService.registerCourse(
      accountId,
      idCourse,
      false
    );

    if (!courseRegistration) {
      return res.status(301).json({
        success: false,
        message: `Xảy ra lỗi trong quá trình đăng ký.`,
      });
    }

    if (account.firebaseNotifications.length > 0) {
      var messageNotify = `Bạn đã trở thành học viện của khóa học - ${course.name}`;
      const notify = new notificationModel({
        accountId: new mongoose.Types.ObjectId(accountId),
        title: "Thông báo",
        message: messageNotify,
        isRead: false,
        type: "SCHEDULE",
        date: moment(new Date()),
      });
      await notify.save();
      firsebase.sendMessage(
        "Thông báo",
        messageNotify,
        account.firebaseNotifications[0].token
      );
    }

    return res.status(200).json({
      success: true,
      message: `Đăng ký khóa học thành công`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const listMyCourses = async (req, res) => {
  try {
    const { accountId } = req.params;
    const account = await accountService.findAccountById(accountId);

    if (!account) {
      return res.status(301).json({
        success: false,
        message: `Tài khoản không tồn tại`,
      });
    }

    const courses = await courseRegistrationService.findRegisterCourse({
      studentAccountId: new mongoose.Types.ObjectId(accountId),
    });

    return res.status(200).json({
      success: true,
      data: { courses: courses },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const getListScheduleWithDay = async (req, res) => {
  try {
    const { accountId, numDay } = req.query;
    const account = await accountService.findAccountById(accountId);

    if (!account) {
      return res.status(301).json({
        success: false,
        message: `Tài khoản không tồn tại`,
      });
    }

    var schedules = await courseRegistrationService.getScheduleOfStudent(
      accountId,
      parseInt(numDay)
    );

    return res.status(200).json({
      success: true,
      data: { schedules: schedules },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const getQuizStudent = async (req, res) => {
  try {
    const { accountId, courseQuizId } = req.query;
    const account = await accountService.findAccountById(accountId);

    if (!account) {
      return res.status(301).json({
        success: false,
        message: `Tài khoản không tồn tại`,
      });
    }

    var quiz = await courseService.getQuizDetail(accountId, courseQuizId);

    return res.status(200).json({
      success: true,
      data: { quiz: quiz },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const completeQuizByStudent = async (req, res) => {
  try {
    const data = req.body;
    if (
      !data.studentAccountId ||
      !data.cycleCourseId ||
      !data.courseQuizId ||
      !data.numberOfTimes ||
      !data.questionAnwers
    ) {
      return res.status(301).json({
        success: false,
        message: `Field: studentAccountId, cycleCourseId, courseQuizId, numberOfTimes, questionAnwers are required`,
      });
    }
    const account = await accountService.findAccountById(data.studentAccountId);

    if (!account) {
      return res.status(301).json({
        success: false,
        message: `Tài khoản không tồn tại`,
      });
    }

    var quiz = await courseService.getQuizDetail(
      data.studentAccountId,
      data.courseQuizId
    );

    if (!quiz) {
      return res.status(301).json({
        success: false,
        message: `Quiz không tồn tại`,
      });
    }

    if (quiz.questions.length != data.questionAnwers.length) {
      return res.status(301).json({
        success: false,
        message: `Chưa trả lời hết câu hỏi`,
      });
    }

    var numCorrectAnswer = 0;
    for (var i = 0; i < quiz.questions.length; i++) {
      for (var j = 0; j < data.questionAnwers.length; j++) {
        if (quiz.questions[i]._id == data.questionAnwers[j].questionId) {
          if (!data.questionAnwers[j].answerId) {
          } else {
            for (var k = 0; k < quiz.questions[i].answers.length; k++) {
              if (
                quiz.questions[i].answers[k]._id ==
                  data.questionAnwers[j].answerId &&
                quiz.questions[i].answers[k].isCorrect == true
              ) {
                numCorrectAnswer++;
              }
            }
          }
        }
      }
    }

    var questionAnwers = [];
    for (var i = 0; i < data.questionAnwers.length; i++) {
      var objectData = {
        questionId: new mongoose.Types.ObjectId(
          data.questionAnwers[i].questionId
        ),
      };
      if (!data.questionAnwers[i].answerId) {
      } else {
        objectData.answerId = new mongoose.Types.ObjectId(
          data.questionAnwers[i].answerId
        );
      }
      questionAnwers.push(objectData);
    }

    var quizScoreObject = {
      studentAccountId: new mongoose.Types.ObjectId(data.studentAccountId),
      cycleCourseId: new mongoose.Types.ObjectId(data.cycleCourseId),
      courseQuizId: new mongoose.Types.ObjectId(data.courseQuizId),
      questionAnwers: questionAnwers,
      expectScore: 50,
      numCorrectAnswer: numCorrectAnswer,
      actualScore: (numCorrectAnswer / questionAnwers.length) * 100,
      numberOfTimes: data.numberOfTimes,
    };

    var score = await courseService.getQuizScore({
      studentAccountId: new mongoose.Types.ObjectId(data.studentAccountId),
      cycleCourseId: new mongoose.Types.ObjectId(data.cycleCourseId),
      courseQuizId: new mongoose.Types.ObjectId(data.courseQuizId),
    });
    var quizScore;

    if (!score) {
      var newQuizScore = new quizzScoresModel(quizScoreObject);
      quizScore = await newQuizScore.save();
    } else {
      quizScore = await quizzScoresModel.findByIdAndUpdate(
        score._id,
        quizScoreObject
      );
    }

    return res.status(200).json({
      success: true,
      data: { quizScore: quizScore },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const getResultQuizOfStudent = async (req, res) => {
  try {
    const { accountId, courseId } = req.query;
    const account = await accountService.findAccountById(accountId);

    if (!account) {
      return res.status(301).json({
        success: false,
        message: `Tài khoản không tồn tại`,
      });
    }

    var result = await courseService.getResultOfStudent(accountId, courseId);

    return res.status(200).json({
      success: true,
      data: { result: result },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const getResultAssignmentOfStudent = async (req, res) => {
  try {
    const { accountId, assignmentId } = req.params;
    const account = await accountService.findAccountById(accountId);

    if (!account) {
      return res.status(301).json({
        success: false,
        message: `Tài khoản không tồn tại`,
      });
    }

    var result = await courseService.getAssignmentDetail(
      accountId,
      assignmentId
    );

    return res.status(200).json({
      success: true,
      data: { assignment: result },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const completeAssignmentByStudent = async (req, res) => {
  try {
    const data = req.body;
    if (
      !data.studentAccountId ||
      !data.assignmentId ||
      !data.numberOfTimes ||
      !data.questionAnwers
    ) {
      return res.status(301).json({
        success: false,
        message: `Field: studentAccountId, assignmentId, numberOfTimes, questionAnwers are required`,
      });
    }
    const account = await accountService.findAccountById(data.studentAccountId);

    if (!account) {
      return res.status(301).json({
        success: false,
        message: `Tài khoản không tồn tại`,
      });
    }

    var assignment = await courseService.getAssignment(data.assignmentId);
    if (!assignment) {
      return res.status(301).json({
        success: false,
        message: `Assignment không tồn tại`,
      });
    }

    if (assignment.questions.length != data.questionAnwers.length) {
      return res.status(301).json({
        success: false,
        message: `Chưa trả lời hết câu hỏi`,
      });
    }

    var numCorrectAnswer = 0;
    for (var i = 0; i < assignment.questions.length; i++) {
      for (var j = 0; j < data.questionAnwers.length; j++) {
        if (assignment.questions[i]._id == data.questionAnwers[j].questionId) {
          if (!data.questionAnwers[j].answerId) {
          } else {
            for (var k = 0; k < assignment.questions[i].answers.length; k++) {
              if (
                assignment.questions[i].answers[k]._id ==
                  data.questionAnwers[j].answerId &&
                assignment.questions[i].answers[k].isCorrect == true
              ) {
                numCorrectAnswer++;
              }
            }
          }
        }
      }
    }

    var questionAnwers = [];
    for (var i = 0; i < data.questionAnwers.length; i++) {
      var objectData = {
        questionId: new mongoose.Types.ObjectId(
          data.questionAnwers[i].questionId
        ),
      };
      if (!data.questionAnwers[i].answerId) {
      } else {
        objectData.answerId = new mongoose.Types.ObjectId(
          data.questionAnwers[i].answerId
        );
      }
      questionAnwers.push(objectData);
    }

    var assignmentScoreObject = {
      studentAccountId: new mongoose.Types.ObjectId(data.studentAccountId),
      assignmentId: new mongoose.Types.ObjectId(data.assignmentId),
      questionAnwers: questionAnwers,
      expectScore: 50,
      numCorrectAnswer: numCorrectAnswer,
      actualScore: (numCorrectAnswer / questionAnwers.length) * 100,
      numberOfTimes: data.numberOfTimes,
    };

    var assignmentOld = await courseService.getAssignmentDetail(data.studentAccountId,data.assignmentId);
    var resultAssignment;
    if(!assignmentOld){
      var newQuizScore = new assignmentScoreModel(assignmentScoreObject);
      resultAssignment = await newQuizScore.save();
    } else {
      resultAssignment = await assignmentScoreModel.findByIdAndUpdate(
        assignmentOld._id,
        assignmentScoreObject
      );
    }

    return res.status(200).json({
      success: true,
      data: { quizScore: resultAssignment },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

module.exports = {
  getListCourse,
  getCourseDetail,
  filteredCourses,
  checkStatusCourse,
  listMyCourses,
  getMyCourseDetail,
  getCoursesWithFilter,
  getCourseCategory,
  getCoursesWithQuery,
  getListScheduleWithDay,
  getQuizStudent,
  completeQuizByStudent,
  getResultQuizOfStudent,
  registerFreeCourse,
  getResultAssignmentOfStudent,
  completeAssignmentByStudent,
};
