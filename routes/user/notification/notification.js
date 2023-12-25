var express = require("express");
var router = express.Router();
const notificationController = require("../../../controller/user/notification.controller");

router.get("/all-notification/:accountId", notificationController.getListNotification);

module.exports = router;