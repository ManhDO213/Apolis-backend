const mongoose = require("mongoose");

const paymentTransactionSchema = mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
    },
    amount: {
      type: Number,
      require: true,
    },
    status: {
      type: String,
      require: true,
    },
    date: {
      type: Date,
      require: true,
    },
    description: {
      type: String,
      require: true,
    },
    tradingCode: {
      type: String,
      required: true,
    },
  },
  { collection: "payment_transaction" }
);

module.exports = mongoose.model(
  "payment_transaction",
  paymentTransactionSchema
);
