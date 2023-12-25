const mongoose = require("mongoose");
const questionModel = require("../../../models/course/quizzQuestion.js");

const createQuestionCourse = async (data) => {
  try {
    const questionCourse = new questionModel(data);
    console.log(`[createQuizesCourse] data quizes course: ${questionCourse}`);
    const createQuestionCourse = await questionCourse.save();
    return createQuestionCourse;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createQuestionCourse,
};
