var express = require("express");
var logoutRouter = express.Router();
const loginController = require("../../controller/login/loginController");

logoutRouter.get("/", loginController.logout);


module.exports = logoutRouter;
