const mongoose = require("mongoose");
const profileService = require("../../service/user/profileService");
const accountService = require("../../service/user/accountService");
const mime = require("mime-types");

const getProfileTeacherDetail = async (req, res) => {
  try {
    let accountId = req.params.accountId;
    const profileTeacher = await profileService.findAccountDetailByID(
      accountId
    );
    console.log(
      `[getProfileTeacherDetail] profileTeacher: -> ${profileTeacher}`
    );

    if (!profileTeacher) {
      return res.status(301).json({
        success: false,
        message: `profileTeacher not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: { profileTeacher: profileTeacher },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    let accountId = req.params.accountId;
    let infomation = req.body;
    const avatar = req.file;
    const baseUrl = req.protocol + "://" + req.get("host") + "/";

    const account = await accountService.findOneAccount({
      _id: new mongoose.Types.ObjectId(accountId),
    });
    const profile = await profileService.getProfile({
      accountId: new mongoose.Types.ObjectId(accountId),
    });

    if (!account || !profile) {
      return res.status(400).json({
        success: false,
        message: `Tài khoản không tồn tại`,
      });
    }

    if (
      isStringNotNullOrEmpty(infomation.email) &&
      account.email != infomation.email
    ) {
      if (validateEmail(infomation.email)) {
        const accounts = await accountService.getAccounts({
          email: infomation.email,
        });
        if (accounts.length == 0) {
          account.email = infomation.email;
        } else {
          return res.status(400).json({
            success: false,
            message: `Email đã tồn tại`,
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: `Email không hợp lệ`,
        });
      }
    }

    if (isStringNotNullOrEmpty(infomation.phoneNumber)) {
      if (validatePhoneNumber(infomation.phoneNumber)) {
        account.phoneNumber = infomation.phoneNumber;
      } else {
        return res.status(400).json({
          success: false,
          message: `Số điện thoại không hợp lệ`,
        });
      }
    }

    if (isStringNotNullOrEmpty(infomation.name)) {
      profile.name = infomation.name;
    }

    if (isStringNotNullOrEmpty(infomation.gender)) {
      if (infomation.gender == "MALE" || infomation.gender == "FEMALE") {
        profile.gender = infomation.gender;
      } else {
        return res.status(400).json({
          success: false,
          message: `Giới tính phải là MALE hoặc FEMALE`,
        });
      }
    }

    if (avatar) {
      profile.avatarUrl = `${baseUrl}${avatar.destination}${avatar.filename}`;
    }

    await profileService.updateProfile(profile._id, profile);
    await accountService.findByIdAndUpdate(accountId, account);
    const newAccount = await accountService.findOneAccount({
      _id: new mongoose.Types.ObjectId(accountId),
    });
    return res.status(200).json({
      success: true,
      message: "Cập nhật thành công",
      data: {
        account: newAccount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validatePhoneNumber(phoneNumber) {
  const regex = /^\d{10,12}$/;
  return regex.test(phoneNumber);
}

function isStringNotNullOrEmpty(str) {
  return typeof str === "string" && str.length > 0;
}

module.exports = {
  getProfileTeacherDetail,
  updateProfile,
};