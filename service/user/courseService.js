const courseModel = require("../../models/course/courseModel");
const quizzesCourse = require("../../models/course/quizzesCourse");
const quizzScoresModel = require("../../models/course/quizzScoresModel");
const assigmentCourseModel = require("../../models/course/assigmentCourseModel");
const mongoose = require("mongoose");

const getCourseList = async (limit, page, filter, applyMatchNum) => {
  const skip = (page - 1) * limit;
  const pipeline = [
    {
      $match: filter,
    },
    {
      $lookup: {
        from: "course_registration",
        localField: "_id",
        foreignField: "courseId",
        as: "registrations",
      },
    },
    {
      $addFields: {
        numRegister: { $size: "$registrations" },
      },
    },
    {
      $project: {
        registrations: 0,
      },
    },
    { $skip: skip },
    { $limit: limit },
  ];
  if (applyMatchNum) {
    pipeline.push({
      $match: {
        numRegister: { $gt: 0 },
      },
    });
  }
  return await courseModel.aggregate(pipeline);
};

const findCourseByID = async (idCourse) => {
  try {
    const pipeline = [
      {
        $match: { _id: new mongoose.Types.ObjectId(idCourse) },
      },
      {
        $lookup: {
          from: "course_registration",
          localField: "_id",
          foreignField: "courseId",
          as: "registrations",
        },
      },
      {
        $addFields: {
          numRegister: { $size: "$registrations" },
        },
      },
      {
        $project: {
          registrations: 0,
        },
      },
      {
        $lookup: {
          from: "profile",
          localField: "teacherAccountId",
          foreignField: "accountId",
          as: "profile",
        },
      },
      {
        $unwind: {
          path: "$profile",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "document_courses",
          localField: "_id",
          foreignField: "courseId",
          as: "documents",
          pipeline: [
            {
              $project: {
                _id: 1,
                session: 1,
                documents: 1,
              },
            },
          ],
        },
      },
    ];

    var courses = await courseModel.aggregate(pipeline);
    if (courses.length != 1) {
      return null;
    }
    return courses[0];
  } catch (error) {
    console.error(error);
  }
};

const findDetailMyCourse = async (idCourse, accountId) => {
  try {
    const pipeline = [
      {
        $match: { _id: new mongoose.Types.ObjectId(idCourse) },
      },
      {
        $lookup: {
          from: "profile",
          localField: "teacherAccountId",
          foreignField: "accountId",
          as: "profile",
        },
      },
      {
        $unwind: {
          path: "$profile",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "cycle_courses",
          localField: "_id",
          foreignField: "courseId",
          as: "cycle_courses",
        },
      },
      {
        $unwind: {
          path: "$cycle_courses",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "schedule",
          localField: "_id",
          foreignField: "courseId",
          as: "schedule",
        },
      },
      {
        $addFields: {
          scheduleCompleted: {
            $cond: [{ $lte: ["$schedule.endDate", new Date()] }, 1, 0],
          },
        },
      },
      {
        $lookup: {
          from: "document_courses",
          localField: "_id",
          foreignField: "courseId",
          as: "documents",
          pipeline: [
            {
              $project: {
                _id: 1,
                session: 1,
                documents: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "quizes_courses",
          localField: "_id",
          foreignField: "courseId",
          as: "quizes",
          pipeline: [
            {
              $lookup: {
                from: "question_courses",
                localField: "_id",
                foreignField: "courseQuizId",
                as: "questions",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      question: 1,
                      answers: 1,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "quizz_scores",
                localField: "_id",
                foreignField: "courseQuizId",
                as: "score",
                pipeline: [
                  {
                    $match: {
                      studentAccountId: new mongoose.Types.ObjectId(accountId),
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      questionAnwers: 1,
                      expectScore: 1,
                      actualScore: 1,
                      numberOfTimes: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$score",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 1,
                session: 1,
                questions: 1,
                scores: 1,
                endDurationSeconds: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "assignment",
          localField: "category",
          foreignField: "type",
          as: "assignment",
          pipeline: [
            {
              $lookup: {
                from: "assignment_scores",
                localField: "_id",
                foreignField: "assignmentId",
                as: "score",
                pipeline: [
                  {
                    $match: {
                      studentAccountId: new mongoose.Types.ObjectId(accountId),
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$score",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "question_assignment",
                localField: "_id",
                foreignField: "assignmentId",
                as: "questions",
              },
            },
          ],
        },
      },
    ];

    var courses = await courseModel.aggregate(pipeline);
    if (courses.length != 1) {
      return null;
    }
    return courses[0];
  } catch (error) {
    console.error(error);
  }
};

const filterCourse = async (minFeeCoin, maxFeeCoin, name) => {
  try {
    const query = {};

    if (minFeeCoin !== undefined) {
      query.feeCoin = { $gte: Number(minFeeCoin) };
    }
    if (maxFeeCoin !== undefined) {
      query.feeCoin = Object.assign({}, query.feeCoin, {
        $lte: Number(maxFeeCoin),
      });
    }
    if (name !== undefined) {
      return await courseModel.find({ name: { $regex: name, $options: "i" } });
    }

    return await courseModel.find(query);
  } catch (err) {
    console.error(err);
  }
};

const getCourseCategories = async () => {
  const categories = await courseModel.distinct("category");
  return categories;
};

const getQuizDetail = async (accountId, courseQuizId) => {
  try {
    const pipeline = [
      {
        $match: { _id: new mongoose.Types.ObjectId(courseQuizId) },
      },
      {
        $lookup: {
          from: "question_courses",
          localField: "_id",
          foreignField: "courseQuizId",
          as: "questions",
          pipeline: [
            {
              $project: {
                _id: 1,
                question: 1,
                answers: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "quizz_scores",
          localField: "_id",
          foreignField: "courseQuizId",
          as: "score",
          pipeline: [
            {
              $match: {
                studentAccountId: new mongoose.Types.ObjectId(accountId),
              },
            },
            {
              $project: {
                _id: 1,
                questionAnwers: 1,
                expectScore: 1,
                actualScore: 1,
                numberOfTimes: 1,
                numCorrectAnswer: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$score",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          session: 1,
          endDurationSeconds: 1,
          questions: 1,
          score: 1,
        },
      },
    ];

    var quizs = await quizzesCourse.aggregate(pipeline);

    if (quizs.length != 1) {
      return null;
    }
    return quizs[0];
  } catch (error) {
    console.error(error);
  }
};

const getQuizScore = async (filter) => {
  try {
    const pipeline = [
      {
        $match: filter,
      },
      {
        $project: {
          _id: 1,
          questionAnwers: 1,
          expectScore: 1,
          actualScore: 1,
          numCorrectAnswer: 1,
          numberOfTimes: 1,
        },
      },
    ];

    var scoreQuiz = await quizzScoresModel.aggregate(pipeline);

    if (scoreQuiz.length != 1) {
      return null;
    }
    return scoreQuiz[0];
  } catch (error) {
    console.error(error);
  }
};

const getResultOfStudent = async (accountId, courseId) => {
  try {
    const pipeline = [
      {
        $match: { _id: new mongoose.Types.ObjectId(courseId) },
      },
      {
        $lookup: {
          from: "schedule",
          localField: "_id",
          foreignField: "courseId",
          as: "schedule",
          pipeline: [
            {
              $lookup: {
                from: "attendance",
                localField: "_id",
                foreignField: "scheduleId",
                as: "attendance",
                pipeline: [
                  {
                    $match: {
                      studentAccountId: new mongoose.Types.ObjectId(accountId),
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      isPresent: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$attendance",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                isPresent: {
                  $ifNull: ["$attendance.isPresent", false],
                },
                session: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "quizes_courses",
          localField: "_id",
          foreignField: "courseId",
          as: "quizes",
          pipeline: [
            {
              $lookup: {
                from: "quizz_scores",
                localField: "_id",
                foreignField: "courseQuizId",
                as: "score",
                pipeline: [
                  {
                    $match: {
                      studentAccountId: new mongoose.Types.ObjectId(accountId),
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      actualScore: 1,
                      expectScore: 1,
                      numCorrectAnswer: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$score",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                session: 1,
                score: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          schedule: 1,
          quizes: 1,
        },
      },
    ];

    var results = await courseModel.aggregate(pipeline);

    if (results.length != 1) {
      return null;
    }
    return results[0];
  } catch (error) {
    console.error(error);
  }
};

const getAssignmentDetail = async (accountId, assignmentId) => {
  try {
    const pipeline = [
      {
        $match: { _id: new mongoose.Types.ObjectId(assignmentId) },
      },
      {
        $lookup: {
          from: "assignment_scores",
          localField: "_id",
          foreignField: "assignmentId",
          as: "score",
          pipeline: [
            {
              $match: {
                studentAccountId: new mongoose.Types.ObjectId(accountId),
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$score",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "question_assignment",
          localField: "_id",
          foreignField: "assignmentId",
          as: "questions",
        },
      },
    ];

    var results = await assigmentCourseModel.aggregate(pipeline);

    if (results.length != 1) {
      return null;
    }
    return results[0];
  } catch (error) {
    console.error(error);
  }
};

const getAssignment = async (assignmentId) => {
  try {
    const pipeline = [
      {
        $match: { _id: new mongoose.Types.ObjectId(assignmentId) },
      },
      {
        $lookup: {
          from: "question_assignment",
          localField: "_id",
          foreignField: "assignmentId",
          as: "questions",
        },
      },
    ];

    var results = await assigmentCourseModel.aggregate(pipeline);

    if (results.length != 1) {
      return null;
    }
    return results[0];
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  findCourseByID,
  filterCourse,
  findDetailMyCourse,
  getCourseCategories,
  getCourseList,
  getQuizDetail,
  getQuizScore,
  getResultOfStudent,
  getAssignmentDetail,
  getAssignment,
};
