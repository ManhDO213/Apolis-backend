var express = require("express");
var router = express.Router();
var CheckPermission = require("../../../middleware/permission");
const manageStudent = require("../../../controller/admin/account/studentController");

router.get(
  "/list-student",
  CheckPermission.checkRole(["ADMIN"]),
  manageStudent.listStudent
);

router.get(
  "/detail-student/:idAccount",
  CheckPermission.checkRole(["ADMIN"]),
  manageStudent.detailStudent
);


router.get(
  "/statistical-student",
  CheckPermission.checkRole(["ADMIN"]),
  manageStudent.statisticalStudent
);

router.get(
  "/account-student",
  CheckPermission.checkRole(["ADMIN"]),
  manageStudent.accountStudent
);

router.post(
  "/lock-account/:idAccount",
  CheckPermission.checkRole(["ADMIN"]),
  manageStudent.lockAccount
);

router.post(
  "/unlock-account/:idAccount",
  CheckPermission.checkRole(["ADMIN"]),
  manageStudent.unLockAccount
);

module.exports = router;
