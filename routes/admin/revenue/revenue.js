var express = require("express");
var router = express.Router();
var CheckPermission = require("../../../middleware/permission");
const manageRevenue = require("../../../controller/admin/revenue/revenueStatistics");

router.get(
  "/revenue-statistical",
  CheckPermission.checkRole(["ADMIN"]),
  manageRevenue.listRevenueStatistics
);

module.exports = router;
