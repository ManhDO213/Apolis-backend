var express = require("express");
var router = express.Router();
var CheckPermission = require("../../../middleware/permission");
const manageTeacher = require("../../../controller/admin/account/teacherController");
const multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const fileConfig = `${file.fieldname}-${Date.now()}-${file.originalname}`;
    cb(null, fileConfig);
  },
});
var upload = multer({ storage: storage });

router.get(
  "/list-teacher",
  CheckPermission.checkRole(["ADMIN"]),
  manageTeacher.listTeacher
);

router.get(
  "/list-lock-teacher",
  CheckPermission.checkRole(["ADMIN"]),
  manageTeacher.listLockTeacher
);

router.get(
  "/statistical-teacher",
  CheckPermission.checkRole(["ADMIN"]),
  manageTeacher.statisticalTeacher
);

router.get(
  "/account-teacher",
  CheckPermission.checkRole(["ADMIN"]),
  manageTeacher.accountTeacher
);

router.get(
  "/detail-teacher/:idAccount",
  CheckPermission.checkRole(["ADMIN"]),
  manageTeacher.detailTeacher
);

router.post(
  "/add-account-teacher",
  CheckPermission.checkRole(["ADMIN"]),
  manageTeacher.addAccountTeacher
);

router.get(
  "/edit-account-teacher",
  CheckPermission.checkRole(["ADMIN"]),
  manageTeacher.editTeacher
);

router.post(
  "/lock-account/:idAccount",
  CheckPermission.checkRole(["ADMIN"]),
  manageTeacher.lockAccount
);

router.post(
  "/unlock-account/:idAccount",
  CheckPermission.checkRole(["ADMIN"]),
  manageTeacher.unLockAccount
);


module.exports = router;
