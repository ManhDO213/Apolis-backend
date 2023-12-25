const mongoose = require("mongoose");
const quizesModel = require("../../../models/course/quizzesCourse.js");

const createQuizesCourse = async (data) => {
  try {
    const quizesCourse = new quizesModel(data);
    console.log(`[createQuizesCourse] data quizes course: ${quizesCourse}`);
    const createQuizesCourse = await quizesCourse.save();
    return createQuizesCourse;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createQuizesCourse,
};
