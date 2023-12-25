var cron = require("node-cron");
const firsebase = require("../modules/firsebase");
const accountService = require("../service/user/accountService");

const initializeCronSchedule = async () => {
  try {
    const taskSunday = cron.schedule("0 7 * * 0", async () => {
      const accounts = await accountService.getAccounts({ role: "STUDENT" });
      var tokens = [];
      for (var i = 0; i < accounts.length; i++) {
        if (accounts[i].firebaseNotifications.length > 0) {
          tokens.push(accounts[i].firebaseNotifications[0].token);
        }
      }
      firsebase.sendMessageToMultiple(
        "Thông báo",
        "Cuối tuần rồi. Cùng ôn luyện Anh ngữ với Apolis nhé!",
        tokens
      );
    });
    taskSunday.start();

    const taskMonday = cron.schedule("0 7 * * 1", async function () {
      const accounts = await accountService.getAccounts({ role: "STUDENT" });
      var tokens = [];
      for (var i = 0; i < accounts.length; i++) {
        if (accounts[i].firebaseNotifications.length > 0) {
          tokens.push(accounts[i].firebaseNotifications[0].token);
        }
      }
      firsebase.sendMessageToMultiple(
        "Thông báo",
        "Chúc bạn đầu tuần vui vẻ!",
        tokens
      );
    });
    taskMonday.start();

    console.log("Initialize Cron Schedule Success");
  } catch (e) {
    console.log("Initialize Cron Schedule Error: ", e);
  }
};

module.exports = {
  initializeCronSchedule,
};
