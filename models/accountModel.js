const mongoose = require("mongoose");

const accountSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: false,
    },
    lockReason: {
      type: String,
      required: false,
    },
    firebaseNotifications: [
      {
        deviceId: { type: String, required: true },
        token: { type: String, required: true },
        osPlatform: { type: String, required: true },
      },
    ],
    resetToken: {
      type: String,
    },
    resetTokenExpiration: {
      type: String,
    },
  },
  { collection: "account" }
);

module.exports = mongoose.model("account", accountSchema);