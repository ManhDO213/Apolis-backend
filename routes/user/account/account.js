var express = require("express");
var router = express.Router();
const accountController = require("../../../controller/user/accountController");

router.post("/register", accountController.register);

router.post("/login", accountController.login);

router.post("/change-password", accountController.changePassword);

router.post("/send-code", accountController.sendResetCode);

router.post("/check-token-password", accountController.checkTokenPassword);

router.post("/reset-password", accountController.resetPassword);

module.exports = router;