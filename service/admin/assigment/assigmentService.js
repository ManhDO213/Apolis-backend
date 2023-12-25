const mongoose = require("mongoose");
const courseModel = require("../../../models/course/courseModel");
const assigmentModel = require("../../../models/course/assigmentCourseModel");
const questionAssignmentModel = require("../../../models/course/questionAssignmentModel");
const moment = require("moment");
const Joi = require("joi");

const listCategoryAssigment = async () => {
  const pipeline = [
    {
      $lookup: {
        from: "question_assignment",
        localField: "_id",
        foreignField: "assignmentId",
        as: "question_assignment",
      },
    },
  ];

  const listCategoryAssigment = await assigmentModel.aggregate(pipeline);
  console.log(
    `[listCategoryAssigment] listattendance -> ${JSON.stringify(
      listCategoryAssigment
    )}`
  );
  return listCategoryAssigment;
};

const listAssigment = async (assignmentId) => {
  const pipeline = [
    {
      $lookup: {
        from: "question_assignment",
        localField: "_id",
        foreignField: "assignmentId",
        as: "question_assignment",
      },
    },
    {
      $match: { "question_assignment.assignmentId": new mongoose.Types.ObjectId(assignmentId) },
    },
  ];

  const listAssigment = await assigmentModel.aggregate(pipeline);
  console.log(
    `[listAssigment] listAssigment -> ${JSON.stringify(
      listAssigment
    )}`
  );
  return listAssigment;
};

module.exports = {
  listCategoryAssigment,
  listAssigment
};
