const adminRouter = require("./admin/admin");
const userRouter = require("./user/user");
const teacherRouter = require("./teacher/teacher");
const loginRouter = require("./login/login");
const logoutRouter = require("./login/logout");
const loginController = require("../controller/login/loginController");

function route(app) {
  app.use("/admin", adminRouter);
  app.use("/user", userRouter);
  app.use("/teacher", teacherRouter);
  app.use("/login", loginRouter);
  app.use("/logout", logoutRouter);
  app.use("/", loginController.redirectLogin);
}

module.exports = route;
