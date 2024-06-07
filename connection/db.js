const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

const username = encodeURIComponent('kaifinfograins');
const password = encodeURIComponent('Kaifman98'); 
const cluster = 'cluster0.yubgitf.mongodb.net';
const dbName = 'questglt';

const uri = `mongodb+srv://${username}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority`;





const Database = () => {
  mongoose
    .connect(uri)
    .then(() => {
      console.log("connected to mongoDb ");
    });
};

module.exports = Database;