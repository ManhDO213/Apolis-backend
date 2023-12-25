const notificationModel = require("../../models/notificationModel");

const findNotificationByAccountID = async (filter) => {
  try {
    return await notificationModel.find(filter);
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  findNotificationByAccountID,
};