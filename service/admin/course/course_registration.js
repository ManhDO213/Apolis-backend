const courseModel = require("../../../models/course/courseModel.js");
const mongoose = require("mongoose");
const accountModel = require("../../../models/accountModel.js");
const course_registration = require("../../../models/course/courseRegistrationModel.js");
const cycleCourse = require("../../../models/course/cycleCoursesModel.js");

const findCourseByStudent = async (idAccount) => {
  const pipeline = [
    {
      $match: {
        studentAccountId: new mongoose.Types.ObjectId(idAccount),
      },
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
      $lookup: {
        from: "cycle_courses",
        localField: "courseId",
        foreignField: "courseId",
        as: "cycle_course",
      },
    },
    {
      $addFields: {
        cycle_course: { $arrayElemAt: ["$cycle_course", 0] },
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
  ];
  const listCourse = await course_registration.aggregate(pipeline);
  console.log(`[findCourseByStudent] course -> ${JSON.stringify(listCourse)}`);
  return listCourse;
};

const findStudentByCourse = async (idAccount) => {
  const pipeline = [
    {
      $match: {
        studentAccountId: new mongoose.Types.ObjectId(idAccount),
      },
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
      $lookup: {
        from: "cycle_courses",
        localField: "courseId",
        foreignField: "courseId",
        as: "cycle_course",
      },
    },
    {
      $addFields: {
        cycle_course: { $arrayElemAt: ["$cycle_course", 0] },
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
  ];
  const listCourse = await courseModel.aggregate(pipeline);
  console.log(`[findCourseByStudent] course -> ${JSON.stringify(listCourse)}`);
  return listCourse;
};

const getAllCourseRegister = async () => {
  return await course_registration.find();
};

module.exports = {
  findCourseByStudent,
  findStudentByCourse,
  getAllCourseRegister,
};
