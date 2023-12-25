const paymentTransactionsModel = require("../../../models/payment_transactions_model");
const mongoose = require("mongoose");
const moment = require("moment-timezone");

const getRevenue = async () => {
  var data = {};

  ///day
  const startOfWeek = moment().tz("Asia/Ho_Chi_Minh").startOf("week");
  const endOfWeek = moment().tz("Asia/Ho_Chi_Minh").endOf("week");
  console.log("endOfWeek: ", endOfWeek);

  const pipeline = [
    {
      $match: {
        date: {
          $gte: startOfWeek.toDate(),
          $lte: endOfWeek.toDate(),
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$date",
            timezone: "Asia/Ho_Chi_Minh",
          },
        },
        totalAmount: {
          $sum: "$amount",
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ];

  var resultDays = await paymentTransactionsModel.aggregate(pipeline);
  data.days = resultDays;

  ///month
  const startOfYearBymonth = moment().tz("Asia/Ho_Chi_Minh").startOf("year");
  const endOfYearByMonth = moment().tz("Asia/Ho_Chi_Minh").endOf("year");

  const pipelineMonth = [
    {
      $match: {
        date: {
          $gte: startOfYearBymonth.toDate(),
          $lte: endOfYearByMonth.toDate(),
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m",
            date: "$date",
            timezone: "Asia/Ho_Chi_Minh",
          },
        },
        totalRevenue: {
          $sum: "$amount", // Tính tổng amount
        },
      },
    },
  ];

  var resultMonth = await paymentTransactionsModel.aggregate(pipelineMonth);
  data.months = resultMonth;

  ///year
  const currentYear = moment().tz("Asia/Ho_Chi_Minh").year();
  const startYear = currentYear - 2;

  const startOfYears = moment()
    .tz("Asia/Ho_Chi_Minh")
    .year(startYear)
    .startOf("year");
  const endOfYear = moment().tz("Asia/Ho_Chi_Minh").endOf("year");

  const pipelineYear = [
    {
      $match: {
        date: {
          $gte: startOfYears.toDate(),
          $lte: endOfYear.toDate(),
        },
      },
    },
    {
      $group: {
        _id: { $year: "$date" },
        totalRevenue: {
          $sum: "$amount",
        },
      },
    },
  ];

  var resultYear = await paymentTransactionsModel.aggregate(pipelineYear);
  data.years = resultYear;

  return data;
};

module.exports = {
  getRevenue,
};
