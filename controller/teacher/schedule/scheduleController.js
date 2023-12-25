const accountService = require("../../../service/admin/account/accountService");
const moment = require("moment");

const listSchedule = async (req, res) => {
  try {
    console.log("reqest teacher -> ", req.session.userLogin._id);
    const idAccount = req.session.userLogin._id;
    const schedules = await accountService.findScheduleTeacher(idAccount);
    console.log("[listCourse] list -> ", schedules);
    res.render("./teacher/index.ejs", {
      title: "Lịch giảng dạy",
      routerName: "scheduleTeacher",
      info: req.session.userLogin,
      schedules: schedules,
      moment: moment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

module.exports = {
    listSchedule
};
