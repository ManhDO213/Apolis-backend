const mongoose = require("mongoose");
const accountService = require("../../../service/admin/account/accountService");
const courseService = require("../../../service/admin/course/courseService");
const Account = require("../../../models/accountModel");
const Profile = require("../../../models/profileModel");
const Constants = require("../../../config/constants");
const moment = require("moment");
const Joi = require("joi");
const bcrypt = require("bcrypt");

const listTeacher = async (req, res) => {
  try {
    const listAccount = await accountService.getTeacherAccounts("ACTIVE");
    console.log("listAccount: ", listAccount);
    res.render("./admin/index.ejs", {
      title: "Giảng viên",
      info: req.session.userLogin,
      listAccount: listAccount,
      routerName: "list-teacher",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const listLockTeacher = async (req, res) => {
  try {
    const listAccount = await accountService.getTeacherAccounts("DEACTIVE");
    console.log("[listLockTeacher] listAccount: ", listAccount);
    res.render("./admin/index.ejs", {
      title: "Giảng viên",
      info: req.session.userLogin,
      listAccount: listAccount,
      routerName: "list-lock-teacher",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const statisticalTeacher = async (req, res) => {
  try {
    res.render("./admin/teacher/statisticalTeacher.ejs", { title: "Express" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const detailTeacher = async (req, res) => {
  let { idAccount } = req.params;
  try {
    const account = await accountService.findDetailTeacher(idAccount);
    console.log(`[getDetailAccount] account: -> ${account}`);

    if (!account) {
      return res.status(301).json({
        success: false,
        message: `account not found`,
      });
    }
    res.render("./admin/index.ejs", {
      title: "Chi tiết giảng viên",
      info: req.session.userLogin,
      account: account,
      moment: moment,
      routerName: "detail-teacher",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const accountTeacher = async (req, res) => {
  try {
    res.render("./admin/teacher/accountTeacher.ejs", { title: "Express" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const addAccountTeacher = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    console.log("data ->", req.body);
    const { email, password, phoneNumber, name, gender } = req.body;
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      phoneNumber: Joi.string().required(),
      name: Joi.string().required(),
      gender: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const existingAccount = await accountService.findOneAccount({ email });
    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: "Tài khoản đã tồn tại",
      });
    }

    const validatePassword = accountService.checkPassword(password);
    console.log(`[TeacherController] PasswordValid: --> ${validatePassword}`);
    if (!validatePassword) {
      return res.status(400).json({
        message: "Mật khẩu ít nhất 8 kí tự, ít nhất một chữ hoa và một số.",
      });
    }

    if (gender != "MALE" && gender != "FEMALE") {
      return res.status(400).json({
        success: false,
        message: `Giới tính phải là MALE hoặc FEMALE`,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const account = new Account({
      email,
      password: hashedPassword,
      phoneNumber,
      role: "TEACHER",
      status: "ACTIVE",
    });

    const newAccount = await account.save({ session });

    const newProfile = new Profile({
      accountId: newAccount._id,
      name: name,
      gender: gender,
      avatarUrl: Constants.AVATAR_DEFAULT_URL,
    });

    await newProfile.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `Tạo tài khoản thành công`,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const editTeacher = async (req, res) => {
  try {
    res.render("./admin/index.ejs", {
      title: "Sửa giảng viên",
      info: req.session.userLogin,
      routerName: "edit-teacher",
    });
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
    const listCoure = await courseService.findCourseByMyTeacher(
      idAccount,
      "APPROVED"
    );
    console.log(`[lockAccount] listCoure `, JSON.stringify(listCoure));
    if (listCoure.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Giảng viên này đang có khóa học!`,
      });
    }
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
    return res.redirect("/admin/teacher/list-teacher");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

module.exports = {
  listTeacher,
  statisticalTeacher,
  accountTeacher,
  detailTeacher,
  addAccountTeacher,
  editTeacher,
  listLockTeacher,
  lockAccount,
  unLockAccount,
};
