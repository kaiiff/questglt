const mongoose = require("mongoose");
// mongoose connection here
mongoose.set("strictQuery", true);

const Database = () => {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("connected to mongoDb ");
    });
};

module.exports = Database;