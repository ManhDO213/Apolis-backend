const mongoose = require("mongoose");
const CycleCourse = require("../../../models/course/cycleCoursesModel");

const createNewCycleCourse = async (data) => {
  try {
    const cycleCourse = new CycleCourse(data);
    console.log("data cycle course:  ", cycleCourse);
    const createdCycleCourse = await cycleCourse.save();
    return createdCycleCourse;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createNewCycleCourse,
};
