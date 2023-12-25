const Account = require("../../models/accountModel");
const Profile = require("../../models/profileModel");
const AccountService = require("../../service/user/accountService");
const profileService = require("../../service/user/profileService");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Resgister Account
const register = async (req, res) => {
  try {
    const { email, password, phoneNumber, role, name } = req.body;

    const existingAccount = await AccountService.findOneAccount({ email });
    if (existingAccount) {
      return res.status(301).json({
        success: false,
        message: "Tài khoản đã tồn tại",
      });
    }
    const validatePassword = AccountService.checkPassword(password);
    console.log(`[Register] PasswordValid: --> ${validatePassword}`);
    if (!validatePassword) {
      return res.status(301).json({
        message: "Mật khẩu ít nhất 8 kí tự, ít nhất một chữ hoa và một số.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const account = new Account({
      email,
      password: hashedPassword,
      phoneNumber,
      role,
      status: "ACTIVE"
    });

    console.log(`[Register] newAccount: --> ${account}`);
    const accountSaved = await account.save();

    const profile = new Profile({
      accountId: accountSaved._id,
      name: name,
      avatarUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/1200px-User-avatar.svg.png",
    });

    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Tài khoản đã được tạo thành công",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, deviceId, token, os } = req.body;

    const account = await AccountService.findOneAccount({ email });
    if (!account) {
      return res.status(301).json({
        success: false,
        message: "Email hoặc mật khẩu không hợp lệ",
      });
    }
    console.log(`[Login] findAccount: --> ${account}`);

    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      return res.status(301).json({
        success: false,
        message: "Email hoặc mật khẩu không hợp lệ",
      });
    }

    const tokenLogin = jwt.sign({ id: account._id }, "SECRET_KEY", {
      expiresIn: "1h",
    });
    console.log(`[Login] token: --> ${tokenLogin}`);

    if (deviceId && token && os) {
      const firebaseInfo = {
        deviceId: deviceId,
        token: token,
        osPlatform: os,
      };
      account.firebaseNotifications = [firebaseInfo];
      await AccountService.findByIdAndUpdate(account._id, account);
    }

    return res.status(200).json({
      success: true,
      message: "Login success",
      data: {
        account: account,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword, reNewPassword } = req.body;

    if (!email || !oldPassword || !newPassword || !reNewPassword) {
      return res.status(301).json({
        success: false,
        message:
          "Field: email, oldPassword, newPassword, reNewPassword are required",
      });
    }

    const account = await AccountService.findOneAccount({ email });
    if (!account) {
      return res.status(301).json({
        success: false,
        message: "Email không tồn tại",
      });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, account.password);
    console.log(`[ChangePassword] isPasswordValid: --> ${isPasswordValid}`);
    if (!isPasswordValid) {
      return res.status(301).json({
        success: false,
        message: "Mật khẩu cũ không chính xác",
      });
    }

    console.log(`[ChangePassword] newPassword: --> ${newPassword}`);
    console.log(`[ChangePassword] reNewPassword: --> ${reNewPassword}`);
    const isnewPasswordValid = AccountService.checkChangePasswords(
      newPassword,
      reNewPassword
    );
    console.log(
      `[ChangePassword] isnewPasswordValid: --> ${isnewPasswordValid}`
    );

    if (!isnewPasswordValid.success) {
      return res.status(301).json({
        message: "Mật khẩu mới không hợp lệ",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await AccountService.findByIdAndUpdate(account._id, {
      password: hashedPassword,
    });

    return res.status(200).json({
      success: true,
      message: "Mật khẩu đã được thay đổi thành công",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi",
    });
  }
};

const sendResetCode = async (req, res) => {
  const { email } = req.body;
  try {
    const account = await AccountService.findOneAccount({ email });
    console.log(`[sendResetCode] account => ${account}`);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const resetToken = Math.floor(10000 + Math.random() * 90000);
    const resetTokenExpiration = Date.now() + 120000;

    account.resetToken = resetToken;
    account.resetTokenExpiration = resetTokenExpiration;
    await AccountService.sendResetCode(email, resetToken);
    await account.save();
    res.status(200).json({
      success: true,
      message: `Mã code đã được gửi vào email ${email}`,
    });
  } catch (error) {
    console.error(`[sendResetCode] Error(500): ${error}`);
    res.status(500).json({
      message: "Đã xảy ra lỗi",
    });
  }
};

const resetPassword = async (req, res) => {
  const { email, newPassword, reNewPassword } = req.body;

  try {
    const account = await AccountService.findOneAccount({ email });
    if (!account) {
      return res.status(301).json({ message: "Account not found" });
    }

    const checkPassword = await AccountService.checkChangePasswords(
      newPassword,
      reNewPassword
    );

    if (!checkPassword.success) {
      return res.status(301).json({
        success: true,
        message: checkPassword.message,
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    account.password = hashedPassword;
    account.resetToken = "";
    account.resetTokenExpiration = "";
    await account.save();

    return res.status(200).json({
      success: true,
      message: "Password đã được cập nhật",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi",
    });
  }
};

const checkTokenPassword = async (req, res) => {
  const { email, resetToken } = req.body;
  try {
    const account = await AccountService.findOneAccount({ email });
    console.log(`[checkTokenPassword] account: --> ${account}`);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (
      account.resetToken !== resetToken ||
      Date.now() > account.resetTokenExpiration
    ) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    return res.status(200).json({
      success: true,
      message: "Mã code chinh xac",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi",
    });
  }
};

module.exports = {
  register,
  login,
  changePassword,
  sendResetCode,
  resetPassword,
  checkTokenPassword,
};
