const mongoose = require("mongoose");
const attendanceScheduleModel = require("../../../models/attendanceScheduleModel");
const courseModel = require("../../../models/course/courseModel");
const scheduleModel = require("../../../models/course/scheduleCourse");
const moment = require("moment");
const Joi = require("joi");

const findAttendanceBySchedule = async (idSchedule) => {
  const pipeline = [
    {
      $match: {
        scheduleId: new mongoose.Types.ObjectId(idSchedule),
      },
    },
  ];

  const listAttendance = await attendanceScheduleModel.aggregate(pipeline);
  console.log(
    `[findAttendanceBySchedule] listattendance -> ${JSON.stringify(
      listAttendance
    )}`
  );
  return listAttendance;
};

const findAttendanceAndUpdate = async (idAttendance, data) => {
  return await attendanceScheduleModel.findByIdAndUpdate(idAttendance, data);
};

module.exports = {
  findAttendanceBySchedule,
  findAttendanceAndUpdate
};
