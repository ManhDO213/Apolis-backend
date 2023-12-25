var express = require("express");
var router = express.Router();
const profileController = require("../../../controller/user/profileController");
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
  "/find-profile-by-id/:accountId",
  profileController.getProfileTeacherDetail
);
router.put(
  "/update-profile/:accountId",
  upload.single("avatar"),
  profileController.updateProfile
);

module.exports = router;