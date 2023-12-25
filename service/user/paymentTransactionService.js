const paymentTransactionModel = require("../../models/payment_transactions_model");
const mongoose = require("mongoose");

const savePaymentTransaction = async (
  accountId,
  amount,
  status,
  date,
  description,
  tradingCode
) => {
  const paymentTransaction = new paymentTransactionModel({
    accountId: new mongoose.Types.ObjectId(accountId),
    amount,
    status: status.toUpperCase(),
    date,
    description,
    tradingCode,
  });
  return await paymentTransaction.save();
};

const getPaymentTransaction = async (filter) => {
  return await paymentTransactionModel.find(filter, {
    accountId: false,
  });
};

module.exports = {
  savePaymentTransaction,
  getPaymentTransaction,
};
