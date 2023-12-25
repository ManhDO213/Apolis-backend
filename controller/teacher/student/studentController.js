const mongoose = require("mongoose");
const accountService = require("../../../service/admin/account/accountService");
const courseService = require("../../../service/admin/course/courseService");
const attendanceService = require("../../../service/admin/attendance/attendanceService");
const attendanceModel = require("../../../models/attendanceScheduleModel");
const moment = require("moment");
const Joi = require("joi");

const courseAttendance = async (req, res) => {
  try {
    console.log("reqest teacher -> ", req.session.userLogin._id);
    const teacherAccountId = req.session.userLogin._id;
    const listCourse = await courseService.findCourseByMyTeacher(
      teacherAccountId,
      "APPROVED"
    );
    console.log("[listCourse] list -> ", listCourse);
    res.render("./teacher/index.ejs", {
      title: "Học viên",
      routerName: "courseAttendance",
      info: req.session.userLogin,
      listCourseData: listCourse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const attendance = async (req, res) => {
  try {
    let idCourse = req.params.idCourse;
    let idSchedule = req.params.idSchedule;
    console.log(`[attendance] idSchedule -> ${idSchedule}`);
    const listStudent = await courseService.findStudentByCourse(idCourse);
    console.log(`[attendance] list student -> ${JSON.stringify(listStudent)}`);
    const listAttendance = await attendanceService.findAttendanceBySchedule(
      idSchedule
    );
    console.log(
      `[attendance] list Attendance -> ${JSON.stringify(listAttendance)}`
    );

    for (var i = 0; i < listStudent.length; i++) {
      var isPresent = false;
      for (var j = 0; j < listAttendance.length; j++) {
        if (listStudent[i].accountId.toString() == listAttendance[j].studentAccountId.toString()) {
          isPresent = listAttendance[j].isPresent;
        }
      }
      listStudent[i].isPresent = isPresent;
    }

    res.render("./teacher/index.ejs", {
      title: "Học viên",
      routerName: "attendance",
      info: req.session.userLogin,
      listStudent: listStudent,
      idSchedule: idSchedule,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

// const postAttendance = async (req, res) => {
//   try {
//     const data = JSON.parse(req.body.data);
//     console.log("postAttendance data: ", data);

//     var studentList = [];
//     for (var i = 0; i < data.attendance.length; i++) {
//       const studentAccountId = data.attendance[i].studentAccountId;
//       const scheduleId = data.attendance[i].scheduleId;
//       const isPresent = data.attendance[i].isPresent;

//       const scheduleObj = {
//         scheduleId: scheduleId,
//         studentAccountId: studentAccountId,
//         isPresent: isPresent,
//       };
//       studentList.push(scheduleObj);
//     }
//     await attendanceModel
//     .insertMany(studentList)
//       .then(() => {})
//       .catch((err) => {
//         console.error("Lỗi chèn dữ liệu:", err);
//       });

//     return res.status(200).json({
//       success: true,
//       message: `Điểm danh thành công !`,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: `${error.message}`,
//     });
//   }
// };

const postAttendance = async (req, res) => {
  try {
    const data = req.body; // Không cần phải parse JSON, vì dữ liệu đã được gửi dưới dạng JSON

    var listAttendance = await attendanceService.findAttendanceBySchedule(
      data[0].scheduleId
    );
console.log('listAttendance: ',listAttendance);
    var newAttendanceList = [];
    var updateAttendanceList = [];
    for (var i = 0; i < data.length; i++) {
      // Thay đổi data.attendance thành data
      const studentAccountId = data[i].studentAccountId;
      const scheduleId = data[i].scheduleId;
      const isPresent = data[i].isPresent;
      var isHave = false;
      var attendance;
      for (var j = 0; j < listAttendance.length; j++) {
        if (studentAccountId == listAttendance[j].studentAccountId) {
          isHave = true;
          attendance = listAttendance[j];
        }
      }

      if (isHave) {
        attendance.isPresent = isPresent;
        updateAttendanceList.push(attendance);
      } else {
        const scheduleObj = {
          scheduleId: scheduleId,
          studentAccountId: studentAccountId,
          isPresent: isPresent,
        };
        newAttendanceList.push(scheduleObj);
      }
    }

    await attendanceModel.insertMany(newAttendanceList);

    for (var i = 0; i < updateAttendanceList.length; i++) {
      await attendanceService.findAttendanceAndUpdate(
        updateAttendanceList[i]._id,
        updateAttendanceList[i]
      );
    }

    return res.status(200).json({
      success: true,
      message: "Điểm danh thành công!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const listCourse = async (req, res) => {
  try {
    res.render("./teacher/student/listCourse.ejs", { title: "Express" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const listStudent = async (req, res) => {
  try {
    res.render("./teacher/student/listStudent.ejs", { title: "Express" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const poinStudent1 = async (req, res) => {
  try {
    res.render("./teacher/student/poinStudent1.ejs", { title: "Express" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const poinStudent2 = async (req, res) => {
  try {
    res.render("./teacher/index.ejs", {
      title: "Học viên",
      routerName: "score-board",
      info: req.session.userLogin,
    });
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
    res.render("./teacher/index.ejs", {
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

const editTeacher = async (req, res) => {
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
    res.render("./teacher/index.ejs", {
      title: "Chỉnh sửa giảng viên",
      info: req.session.userLogin,
      moment: moment,
      account: account,
      routerName: "edit-teacher",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

module.exports = {
  courseAttendance,
  attendance,
  listCourse,
  listStudent,
  poinStudent1,
  poinStudent2,
  detailTeacher,
  postAttendance,
  editTeacher
};
