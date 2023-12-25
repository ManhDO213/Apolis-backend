const mongoose = require("mongoose");
const scheduleModel = require("../../../models/course/scheduleCourse.js");

const createSchedule = async (data) => {
  try {
    const scheduleCourse = new scheduleModel(data);
    console.log(`[createSchedule] data schedule course: ${scheduleCourse}`);
    const createSchedule = await scheduleCourse.save();
    return createSchedule;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createSchedule,
};
