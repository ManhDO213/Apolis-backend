var express = require("express");
var loginRouter = express.Router();
const loginController = require("../../controller/login/loginController");

loginRouter.get("/", loginController.login);

loginRouter.post("/", loginController.checkauth);

loginRouter.post("/logout", loginController.logout);


module.exports = loginRouter;
