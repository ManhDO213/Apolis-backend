const accountModel = require("../../models/accountModel");
const nodemailer = require("nodemailer");

const checkPassword = (password) => {
  if (!password) {
    return false;
  }
  if (password.length < 8) {
    return false;
  }
  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return false;
  }
  return true;
};

const checkChangePasswords = (newPassword, confirmPassword) => {
  if (newPassword !== confirmPassword) {
    return { success: false, message: "Mật khẩu mới không khớp" };
  }

  if (!newPassword || !confirmPassword) {
    return { success: false, message: "Mật khẩu mới không được để trống" };
  }

  if (newPassword.length < 8) {
    return { success: false, message: "Mật khẩu mới phải có ít nhất 8 kí tự" };
  }

  if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return {
      success: false,
      message: "Mật khẩu mới phải có ít nhất một chữ hoa và một số",
    };
  }

  return { success: true };
};

const findOneAccount = async (filter) => {
  const pipeline = [
    {
      $match: filter,
    },
    {
      $lookup: {
        from: "profile",
        localField: "_id",
        foreignField: "accountId",
        as: "profile",
      },
    },
    {
      $unwind: {
        path: "$profile",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  var accounts = await accountModel.aggregate(pipeline);
  if (accounts.length != 1) {
    return null;
  }
  return accounts[0];
};

const findAccountById = async (idAccount) => {
  return await accountModel.findById(idAccount);
};

const getAccounts = async (filter) => {
  return await accountModel.find(filter);
};

const getStudentAccounts = async (filter) => {
  try {
    const pipeline = [
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "profile",
          localField: "_id",
          foreignField: "accountId",
          as: "profile",
        },
      },
      {
        $unwind: {
          path: "$profile",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          account: "$$ROOT",
          profile: "$profile",
        },
      },
    ];

    const accounts = await accountModel.aggregate(pipeline);
    return accounts;
  } catch (error) {
    console.error(error);
  }
};

const findByIdAndUpdate = async (idAccount, newInfomation) => {
  return await accountModel.findByIdAndUpdate(idAccount, newInfomation);
};

const sendResetCode = async (email, resetToken) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "manhdvph27217@fpt.edu.vn",
        pass: "qjih ldts eefs tzhv",
      },
    });

    const mailOptions = {
      from: "manhdvph27217@fpt.edu.vn",
      to: email,
      subject: "Xác nhận đổi mật khẩu",
      text: `Mã xác nhận của bạn là: ${resetToken}`,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    throw error;
  }
};

module.exports = {
  checkPassword,
  checkChangePasswords,
  findOneAccount,
  findByIdAndUpdate,
  sendResetCode,
  findAccountById,
  getAccounts,
  getStudentAccounts,
};
