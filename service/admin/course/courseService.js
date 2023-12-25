const courseModel = require("../../../models/course/courseModel.js");
const mongoose = require("mongoose");
const accountModel = require("../../../models/accountModel.js");
const cycleCourse = require("../../../models/course/cycleCoursesModel.js");
const course_registration = require("../../../models/course/courseRegistrationModel.js");

const listCourse = async (status) => {
  const pipeline = [
    {
      $lookup: {
        from: "cycle_courses",
        localField: "_id",
        foreignField: "courseId",
        as: "cycle_course",
      },
    },
    {
      $match: {
        "cycle_course.status": status,
      },
    },
    {
      $addFields: {
        cycle_course: { $arrayElemAt: ["$cycle_course", 0] },
      },
    },
  ];
  return await courseModel.aggregate(pipeline);
};

const findCourseByMyTeacher = async (teacherAccountId, status) => {
  const pipeline = [
    {
      $lookup: {
        from: "cycle_courses",
        localField: "_id",
        foreignField: "courseId",
        as: "cycle_course",
      },
    },
    {
      $match: {
        teacherAccountId: new mongoose.Types.ObjectId(teacherAccountId),
        "cycle_course.status": status,
      },
    },
    {
      $addFields: {
        cycle_course: { $arrayElemAt: ["$cycle_course", 0] },
      },
    },
  ];
  return await courseModel.aggregate(pipeline);
};

const deleteCourse = async (idCourse) => {
  return await courseModel.findByIdAndDelete(idCourse);
};

const findCourseByID2 = async (idCourse) => {
  console.log("idCourse:", idCourse);
  const currentDate = new Date();
  try {
    const pipeline = [
      {
        $match: { _id: new mongoose.Types.ObjectId(idCourse) },
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
        $lookup: {
          from: "profile",
          localField: "teacherAccountId",
          foreignField: "accountId",
          as: "profileData",
        },
      },

      {
        $unwind: {
          path: "$profileData",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "quizes_courses",
          localField: "_id",
          foreignField: "courseId",
          as: "quizes_courses",
        },
      },
      {
        $lookup: {
          from: "document_courses",
          localField: "_id",
          foreignField: "courseId",
          as: "document_courses",
        },
      },
      {
        $lookup: {
          from: "question_courses",
          localField: "quizes_courses._id",
          foreignField: "courseQuizId",
          as: "question_courses",
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
        $unwind: {
          path: "$schedule",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: {
          _id: "$_id",
          course: { $first: "$$ROOT" },
          cycle_courses: { $first: "$cycle_courses" },
          profileData: { $first: "$profileData" },
          question_courses: { $first: "$question_courses" },
          document_courses: { $first: "$document_courses" },
          schedules: { $push: "$schedule" },
        },
      },
    ];

    var course = await courseModel.aggregate(pipeline);
    if (course.length != 1) {
      return null;
    }
    return course[0];
  } catch (error) {
    console.error(error);
  }
};

const findCourseByID3 = async (idCycleCourse) => {
  console.log("idCycleCourse:", idCycleCourse);
  try {
    const pipeline = [
      {
        $match: { _id: new mongoose.Types.ObjectId(idCycleCourse) },
      },
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "courses",
        },
      },
      {
        $unwind: {
          path: "$courses",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "profile",
          localField: "teacherAccountId",
          foreignField: "accountId",
          as: "profileData",
        },
      },
      {
        $unwind: {
          path: "$profileData",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "quizes_courses",
          localField: "courseId",
          foreignField: "courseId",
          as: "quizes_courses",
        },
      },
      {
        $lookup: {
          from: "document_courses",
          localField: "courseId",
          foreignField: "courseId",
          as: "document_courses",
        },
      },
      {
        $lookup: {
          from: "question_courses",
          localField: "courseId",
          foreignField: "quizes_courses.courseId",
          as: "question_courses",
        },
      },
      {
        $lookup: {
          from: "schedule",
          localField: "courseId",
          foreignField: "courseId",
          as: "schedule",
        },
      },
      {
        $group: {
          _id: "$_id",
          course: { $first: "$courses" },
          cycle_courses: { $first: "$$ROOT" },
          profileData: { $first: "$profileData" },
          question_courses: { $first: "$question_courses" },
          document_courses: { $first: "$document_courses" },
          schedules: { $first: "$schedule" },
        },
      },
    ];

    var course = await cycleCourse.aggregate(pipeline);
    if (course.length != 1) {
      return null;
    }
    return course[0];
  } catch (error) {
    console.error(error);
  }
};

const createNewCycleCourse = async (data) => {
  try {
    const cycleCourse = new cycleCourse(data);
    console.log("data cycle course:  ", cycleCourse);
    const createdCycleCourse = await cycleCourse.save();
    return createdCycleCourse;
  } catch (error) {
    throw error;
  }
};

const getTeacherAccounts = async () => {
  try {
    const pipeline = [
      {
        $match: {
          role: "TEACHER",
        },
      },
      {
        $lookup: {
          from: "profile",
          localField: "_id",
          foreignField: "accountId",
          as: "profileData",
        },
      },
      {
        $unwind: {
          path: "$profileData",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          firstName: "$profileData.firstName",
          lastName: "$profileData.lastName",
        },
      },
    ];

    const teacherAccounts = await accountModel.aggregate(pipeline);
    console.log("teacher account =>", teacherAccounts);
    return teacherAccounts;
  } catch (error) {
    console.error(error);
  }
};

const isApprovedCourse = async (courseId) => {
  try {
    const updatedCourse = await cycleCourse.findByIdAndUpdate(
      courseId,
      { status: "APPROVED" },
      { new: true }
    );
    console.log("Update course => ", updatedCourse);
    return updatedCourse;
  } catch (error) {
    throw error;
  }
};

const rejectCourse = async (courseId, lockReason) => {
  try {
    const updatedCourse = await cycleCourse.findByIdAndUpdate(
      courseId,
      { status: "REJECT", lockReason: lockReason },
      { new: true }
    );
    console.log("Update course => ", updatedCourse);
    return updatedCourse;
  } catch (error) {
    throw error;
  }
};

const findStudentByCourse = async (idCourse) => {
  const pipeline = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(idCourse),
      },
    },
    {
      $lookup: {
        from: "course_registration",
        localField: "_id",
        foreignField: "courseId",
        as: "course_registration",
      },
    },
    {
      $unwind: "$course_registration",
    },
    {
      $lookup: {
        from: "account",
        localField: "course_registration.studentAccountId",
        foreignField: "_id",
        as: "account",
      },
    },
    {
      $unwind: "$account",
    },
    {
      $lookup: {
        from: "profile",
        localField: "account._id",
        foreignField: "accountId",
        as: "profile",
      },
    },
    {
      $project: {
        _id: 0,
        profile: { $arrayElemAt: ["$profile", 0] },
        course_registration: 1,
        account: 1,
        schedule: 1,
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ["$profile", "$$ROOT"],
        },
      },
    },
  ];

  const listStudent = await courseModel.aggregate(pipeline);
  console.log(`[findStudentByCourse] course -> ${JSON.stringify(listStudent)}`);
  return listStudent;
};

const getAllCourse = async () => {
  return await courseModel.find();
};

module.exports = {
  listCourse,
  deleteCourse,
  findCourseByID2,
  findCourseByID3,
  createNewCycleCourse,
  getTeacherAccounts,
  isApprovedCourse,
  rejectCourse,
  findCourseByMyTeacher,
  findStudentByCourse,
  getAllCourse,
};
