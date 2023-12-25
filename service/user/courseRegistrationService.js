const mongoose = require("mongoose");
const courseRegistrationModel = require("../../models/course/courseRegistrationModel");
const currentDate = new Date();
const { addDays, format } = require("date-fns");

const registerCourse = async (studentAccountId, courseId, isCompleted) => {
  const courseRegister = new courseRegistrationModel({
    studentAccountId,
    courseId,
    isCompleted,
    progress: 0,
  });
  return await courseRegister.save();
};

const findRegisterCourse = async (filter) => {
  const pipeline = [
    {
      $match: filter,
    },
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
        pipeline: [
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
        ],
      },
    },
    {
      $unwind: {
        path: "$course",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $project: {
        course: 1,
        isCompleted: 1,
        progress: 1,
      },
    },
  ];

  return await courseRegistrationModel.aggregate(pipeline);
};

const getScheduleOfStudent = async (studentAccountId, numDay) => {
  const currentDate = new Date();
  const nextDate = addDays(currentDate, numDay);

  const pipeline = [
    {
      $match: {
        studentAccountId: new mongoose.Types.ObjectId(studentAccountId),
      },
    },
    {
      $lookup: {
        from: "schedule",
        localField: "courseId",
        foreignField: "courseId",
        as: "schedules",
        pipeline: [
          {
            $lookup: {
              from: "courses",
              localField: "courseId",
              foreignField: "_id",
              as: "course",
            },
          },
          {
            $unwind: "$course",
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
            $unwind: "$cycle_course",
          },
        ],
      },
    },
    {
      $unwind: "$schedules",
    },
    {
      $match: {
        "schedules.startDate": {
          $gte: currentDate,
          $lte: nextDate,
        },
      },
    },
    {
      $sort: {
        "schedules.startDate": 1,
      },
    },
    {
      $project: {
        _id: "$schedules._id",
        session: "$schedules.session",
        startDate: "$schedules.startDate",
        endDate: "$schedules.endDate",
        description: "$schedules.description",
        course: "$schedules.course",
        cycle_course: "$schedules.cycle_course",
      },
    },
  ];

  return await courseRegistrationModel.aggregate(pipeline);
};

module.exports = {
  registerCourse,
  findRegisterCourse,
  getScheduleOfStudent,
};
