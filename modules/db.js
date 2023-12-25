const mongoose = require('mongoose');

module.exports.initDbConnection = async () => {
  mongoose
    .connect('mongodb+srv://minhquan:quan1452003@phamminhquan145.ilzcilm.mongodb.net/Apolis')
    .then(() => {
      console.log(`Database connect successfully.`);
    })
    .catch((err) => {
      console.log(`Error connecting: ${err.message}`);
    });
};
