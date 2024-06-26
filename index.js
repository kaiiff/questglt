const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

const path = require("path");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const port = process.env.PORT || 4006;
const userRouter = require("./routers/userRouter");

// db call here
const myDb = require("./connection/db");
myDb();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//to protect our app from vulnerabilities
app.use(helmet());

// static files handle here
app.use("/public/images", express.static("public/images"));

// router handle here
app.use("/user", userRouter);

// get route for testing
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.listen(port, () => {
  console.log(`Server start on ${port} successfully!`);
});
