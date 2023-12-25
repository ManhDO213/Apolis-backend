const moment = require("moment");
let config = require("../../config/default.json");
const accountService = require("../../service/user/accountService");
const courseService = require("../../service/user/courseService");
const paymetnTransactionService = require("../../service/user/paymentTransactionService");
const courseRegistrationService = require("../../service/user/courseRegistrationService");
const firsebase = require("../../modules/firsebase");
const notificationModel = require("../../models/notificationModel");
const mongoose = require("mongoose");

const create_payment_url = async (req, res) => {
  try {
    const { accountId, courseId } = req.body;
    if (!courseId) {
      return res.status(301).json({
        success: false,
        message: "courseId is required",
      });
    }

    if (!accountId) {
      return res.status(301).json({
        success: false,
        message: "accountId is required",
      });
    }

    const existingCourse = await courseService.findCourseByID(courseId);
    if (!existingCourse) {
      return res.status(301).json({
        success: false,
        message: "Khóa học không tồn tại",
      });
    }

    var price = existingCourse.feeCoin;
    if (existingCourse.discount > 0) {
      price = (1 - existingCourse.discount / 100) * existingCourse.feeCoin;
    }

    const existingAccount = await accountService.findAccountById(accountId);
    if (!existingAccount) {
      return res.status(301).json({
        success: false,
        message: "Tài khoản không tồn tại",
      });
    }
    process.env.TZ = "Asia/Ho_Chi_Minh";

    let date = new Date();
    let createDate = moment(date).format("YYYYMMDDHHmmss");

    let ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    const baseUrl = req.protocol + "://" + req.get("host") + "/";
    let tmnCode = config.vnp_TmnCode;
    let secretKey = config.vnp_HashSecret;
    let vnpUrl = config.vnp_Url;
    let returnUrl =
      baseUrl +
      `user/payment/vnpay_return/?accountId=${accountId}&courseId=${courseId}`;
    let orderId = moment(date).format("DDHHmmss");

    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = "vn";
    vnp_Params["vnp_CurrCode"] = "VND";
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderId;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = price * 100;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;

    vnp_Params = sortObject(vnp_Params);

    let querystring = require("qs");
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
    console.log("vnpUrl ", vnpUrl);
    res.status(200).json({
      success: true,
      data: {
        vnpUrl: vnpUrl,
        tradingCode: orderId,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: `Đã xảy ra lỗi ${error}`,
    });
  }
};

const vnpay_return = async (req, res) => {
  try {
    let vnp_Params = req.query;
    console.log("vnp_Params ", vnp_Params);
    let secureHash = vnp_Params["vnp_SecureHash"];
    let vnp_TxnRef = vnp_Params["vnp_TxnRef"];
    let accountId = vnp_Params["accountId"];
    let courseId = vnp_Params["courseId"];
    let amount = vnp_Params["vnp_Amount"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];
    delete vnp_Params["accountId"];
    delete vnp_Params["courseId"];

    vnp_Params = sortObject(vnp_Params);

    let date = new Date();
    let secretKey = config.vnp_HashSecret;

    let querystring = require("qs");
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      const existingCourse = await courseService.findCourseByID(courseId);
      if (!existingCourse) {
        return res.status(301).json({
          success: false,
          message: "Khóa học không tồn tại",
        });
      }

      const account = await accountService.findAccountById(accountId);
      if (!account) {
        return res.status(301).json({
          success: false,
          message: `Tài khoản không tồn tại`,
        });
      }

      const courseRegistration = await courseRegistrationService.registerCourse(
        accountId,
        courseId,
        false
      );

      console.log(
        `[PaymentController] registerCourse courseRegistration: -> ${courseRegistration}`
      );

      if (!courseRegistration) {
        return res.status(301).json({
          success: false,
          message: `Xảy ra lỗi trong quá trình đăng ký.`,
        });
      }

      await paymetnTransactionService.savePaymentTransaction(
        accountId,
        amount / 100,
        "Success",
        moment(date),
        `Đăng ký khóa học thành công: ${existingCourse.name}`,
        vnp_TxnRef
      );

      if (account.firebaseNotifications.length > 0) {
        var messageNotify = `Bạn đã trở thành học viện của khóa học - ${existingCourse.name}`;
        const notify = new notificationModel({
          accountId: new mongoose.Types.ObjectId(accountId),
          title: "Thông báo",
          message: messageNotify,
          isRead: false,
          type: "SCHEDULE",
          date: moment(date),
        });
        await notify.save();
        firsebase.sendMessage(
          "Thông báo",
          messageNotify,
          account.firebaseNotifications[0].token
        );
      }

      res.render("success", { code: vnp_Params["vnp_ResponseCode"] });
    } else {
      await paymetnTransactionService.savePaymentTransaction(
        accountId,
        amount / 100,
        "ERROR",
        moment(date),
        "Đăng ký khóa học thất bại: ${existingCourse.name}",
        vnp_TxnRef
      );
      res.render("fail", { code: "97" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi",
    });
  }
};

const check_payment = async (req, res) => {
  try {
    let { tradingCode } = req.query;
    const payments = await paymetnTransactionService.getPaymentTransaction({
      tradingCode: tradingCode,
    });

    if (!payments) {
      return res.status(400).json({
        success: true,
        message: "Thanh toán thất bại.",
      });
    }

    if (payments.length != 1) {
      return res.status(400).json({
        success: true,
        message: "Thanh toán thất bại.",
      });
    }

    if (payments[0].status != "SUCCESS") {
      return res.status(400).json({
        success: true,
        message: "Thanh toán thất bại.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Thanh toán thành công.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi",
    });
  }
};

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

const getPaymentTrannsaction = async (req, res) => {
  try {
    let { accountId } = req.params;
    console.log(
      "[PaymentController] getPaymentTrannsaction params ->",
      req.params
    );

    const listTransaction =
      await paymetnTransactionService.getPaymentTransaction({
        accountId: new mongoose.Types.ObjectId(accountId),
      });
    return res.status(200).json({
      success: true,
      data: {
        transactions: listTransaction,
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

module.exports = {
  create_payment_url,
  vnpay_return,
  check_payment,
  getPaymentTrannsaction,
};
