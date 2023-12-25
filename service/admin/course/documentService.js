const mongoose = require("mongoose");
const documentCourseModel = require("../../../models/course/documentCourse.js");

const createNewDocumentCourse = async (data) => {
    try {
      const documentCourse = new documentCourseModel(data);
      console.log(`[createNewDocumentCourse] data document course: ${documentCourse}`);
      const createdDocumentCourse = await documentCourse.save();
      return createdDocumentCourse;
    } catch (error) {
      throw error;
    }
  };

  module.exports = {
    createNewDocumentCourse,
};