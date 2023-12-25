var express = require("express");
var router = express.Router();
const paymentController = require("../../../controller/user/paymentController");

router.post("/create_payment_url", paymentController.create_payment_url);

router.get("/vnpay_return", paymentController.vnpay_return);

router.get("/check_payment", paymentController.check_payment);

router.get("/payment-transactions/:accountId", paymentController.getPaymentTrannsaction);

module.exports = router;