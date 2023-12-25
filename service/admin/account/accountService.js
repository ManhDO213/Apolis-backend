const mongoose = require("mongoose");
const accountModel = require("../../../models/accountModel");
const profileModel = require("../../../models/profileModel");
const courseRegistrationModel = require("../../../models/course/courseRegistrationModel");
const courseModel = require("../../../models/course/courseModel");

const checkPassword = (password) => {
  if (!password) {
    return false;
  }
  if (password.length < 8) {
    return false;
  }
  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return false;
  }
  return true;
};

const findOneAccount = async (filter) => {
  return await accountModel.findOne(filter);
};

const getTeacherAccounts = async (status) => {
  try {
    const pipeline = [
      {
        $match: {
          role: "TEACHER",
          status: status,
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
          account: "$$ROOT",
          profile: "$profileData",
        },
      },
    ];

    const teacherAccounts = await accountModel.aggregate(pipeline);
    console.log("[getTeacherAccounts] teacher account =>", teacherAccounts);
    return teacherAccounts;
  } catch (error) {
    console.error(error);
  }
};

const listAccount = async () => {
  return await accountModel.find({});
};

const findDetailTeacher = async (idAccount) => {
  console.log(`[findDetailTeacher] idAcount -> ${idAccount}`);
  try {
    const pipeline = [
      {
        $match: { _id: new mongoose.Types.ObjectId(idAccount) },
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
    ];

    const teacherAccounts = await accountModel.aggregate(pipeline);
    console.log("teacher account =>", teacherAccounts);
    return teacherAccounts;
  } catch (error) {
    console.error(error);
  }
};

const findUserAccount = async (status) => {
  try {
    const pipeline = [
      {
        $match: {
          role: "STUDENT",
          status: status,
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
          account: "$$ROOT",
          profile: "$profileData",
        },
      },
    ];

    const students = await accountModel.aggregate(pipeline);
    console.log("[findUserAccount] student account =>", students);
    return students;
  } catch (error) {
    console.error(error);
  }
};

const findDetailStudent = async (idAccount) => {
  console.log(`[findDetailStudent] idAcount -> ${idAccount}`);
  try {
    const pipeline = [
      {
        $match: { _id: new mongoose.Types.ObjectId(idAccount) },
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
        $lookup: {
          from: "course_registration",
          localField: "_id",
          foreignField: "studentAccountId",
          as: "course_registration",
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "course_registration.courseId",
          foreignField: "_id",
          as: "courses",
        },
      },
    ];

    const teacherAccounts = await accountModel.aggregate(pipeline);
    console.log("student account =>", teacherAccounts);
    return teacherAccounts;
  } catch (error) {
    console.error(error);
  }
};

const findScheduleTeacher = async (idAccount) => {
  console.log(`[findScheduleTeacher] idAcount -> ${idAccount}`);
  const currentDate = new Date();
  try {
    const pipeline = [
      {
        $match: { teacherAccountId: new mongoose.Types.ObjectId(idAccount) },
      },
      {
        $lookup: {
          from: "account",
          localField: "teacherAccountId",
          foreignField: "_id",
          as: "account",
        },
      },
      {
        $unwind: "$account",
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
        $match: {
          "schedule.startDate": { $gte: currentDate },
        },
      },
      {
        $sort: {
          "schedule.startDate": 1,
        },
      },
      {
        $project: {
          _id: "$schedule._id",
          session: "$schedule.session",
          startDate: "$schedule.startDate",
          endDate: "$schedule.endDate",
          description: "$schedule.description",
          courses: "$$ROOT",
          cycle_courses: "$cycle_courses",
        },
      },
    ];
    const courseSchedule = await courseModel.aggregate(pipeline);
    console.log("teacher account =>", courseSchedule);
    return courseSchedule;
  } catch (error) {
    console.error(error);
  }
};

const postLockAccount = async (idAccount, lockReason) => {
  try {
    const updatedAccount = await accountModel.findByIdAndUpdate(
      idAccount,
      { status: "DEACTIVE", lockReason: lockReason },
      { new: true }
    );
    console.log("Lock account => ", updatedAccount);
    return updatedAccount;
  } catch (error) {
    throw error;
  }
};

const postUnLockAccount = async (idAccount, lockReason) => {
  try {
    const updatedAccount = await accountModel.findByIdAndUpdate(
      idAccount,
      { status: "ACTIVE", lockReason: lockReason },
      { new: true }
    );
    console.log("Lock account => ", updatedAccount);
    return updatedAccount;
  } catch (error) {
    throw error;
  }
};

const getAccountsWithRole = async (role) => {
  try {
    const pipeline = [
      {
        $match: {
          role: role,
        },
      },
    ];
    return await accountModel.aggregate(pipeline);
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  checkPassword,
  getTeacherAccounts,
  findOneAccount,
  listAccount,
  findDetailTeacher,
  findUserAccount,
  findDetailStudent,
  findScheduleTeacher,
  postLockAccount,
  postUnLockAccount,
  getAccountsWithRole,
};
