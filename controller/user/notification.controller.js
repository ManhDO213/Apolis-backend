const notificationService = require("../../service/user/notificationService");
const accountService = require("../../service/user/accountService");
const mongoose = require("mongoose");

const getListNotification = async (req, res) => {
  try {
    let accountId = req.params.accountId;
    const isExistAccount = await accountService.findAccountById(accountId);
    if (!isExistAccount) {
      return res.status(301).json({
        success: false,
        message: `Account not found`,
      });
    }

    const listNotification =
      await notificationService.findNotificationByAccountID({
        accountId: new mongoose.Types.ObjectId(accountId),
      });
    console.log(`[getListNotification] list Notification: ${listNotification}`);

    res.status(200).json({
      success: true,
      data: { listNotification: listNotification },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error.message}`,
    });
  }
};

module.exports = {
  getListNotification,
};