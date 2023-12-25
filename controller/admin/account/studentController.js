const mongoose = require("mongoose");
const accountService = require("../../../service/admin/account/accountService");
const courseRegistrationService = require("../../../service/admin/course/course_registration");
const Account = require("../../../models/accountModel");
const Profile = require("../../../models/profileModel");
const Constants = require("../../../config/constants");
const moment = require("moment");
const Joi = require("joi");
const bcrypt = require("bcrypt");

const listStudent = async (req, res) => {
  try {
    console.log("request -> ", req.query.status);
    var status = "ACTIVE";
    if(req.query.status){
      status = req.query.status;
    }
    const listAccount = await accountService.findUserAccount(status);
    console.log("listAccount: ", listAccount);
    res.render("./admin/index.ejs", {
      title: "Học viên",
      info: req.session.userLogin,
      listAccount: listAccount,
      routerName: "list-student",
      status: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const detailStudent = async (req, res) => {
  let { idAccount } = req.params;
  try {
    console.log(`[detailStudent] id account -> ${idAccount}`);
    const account = await accountService.findDetailStudent(idAccount);
    const listCourse = await courseRegistrationService.findCourseByStudent(idAccount);
    console.log(`[detailStudent] list course: -> ${listCourse}`);
    if (!account) {
      return res.status(301).json({
        success: false,
        message: `account not found`,
      });
    }
    if (!listCourse) {
       res.status(301).json({
        success: false,
        message: `listCourse not found`,
      });
    }
    res.render("./admin/index.ejs", {
      title: "Chi tiết học viên",
      info: req.session.userLogin,
      account: account,
      listCourse: listCourse,
      moment: moment,
      routerName: "detail-student",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};


const statisticalStudent = async (req, res) => {
  try {
    res.render("./admin/student/statisticalStudent.ejs", { title: "Express" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const accountStudent = async (req, res) => {
  try {
    res.render("./admin/student/accountStudent.ejs", { title: "Express" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const lockAccount = async (req, res) => {
  try {
    let { idAccount } = req.params;
    const lockReason = req.body.lockReason;
    console.log("[lockAccount] idAccount => ", idAccount);
    console.log("[lockAccount] lockReason => ", lockReason);

    const lockAccount = await accountService.postLockAccount(
      idAccount,
      lockReason
    );
    console.log(`[lockAccount] lockAccount -> ${lockAccount}`);
    res.status(200).json({
      success: true,
      message: `Khóa thành công !`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const unLockAccount = async (req, res) => {
  try {
    let { idAccount } = req.params;
    const lockReason = req.body.lockReason;
    console.log("[unLockAccount] idAccount => ", idAccount);
    console.log("[unLockAccount] lockReason => ", lockReason);
    const lockAccount = await accountService.postUnLockAccount(
      idAccount,
      lockReason
    );
    console.log(`[unLockAccount] unLockAccount -> ${lockAccount}`);
    return res.redirect("/admin/student/list-student");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};


module.exports = {
  listStudent,
  statisticalStudent,
  accountStudent,
  detailStudent,
  lockAccount,
  unLockAccount
};
