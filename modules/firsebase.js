const admin = require("firebase-admin");
const serviceAccount = require("../config/serviceAccountKey.json");

const initializeFiseBase = async () => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://apolis.firebaseio.com",
    });
    console.log("Initialize FiseBase Success");
  } catch (e) {
    console.log("Initialize FiseBase Error: ", e);
  }
};

const sendMessage = async (title, body, token) => {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: token,
  };
  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log("Gửi thông báo thành công:", response);
    })
    .catch((error) => {
      console.log("Lỗi khi gửi thông báo:", error);
    });
};

const sendMessageToMultiple = async (title, body, tokens) => {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    tokens: tokens,
  };
  admin
    .messaging()
    .sendMulticast(message)
    .then((response) => {
      console.log("Gửi thông báo thành công:", response);
    })
    .catch((error) => {
      console.log("Lỗi khi gửi thông báo:", error);
    });
};

module.exports = {
  initializeFiseBase,
  sendMessage,
  sendMessageToMultiple
};
