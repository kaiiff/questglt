const jwt = require("jsonwebtoken");

const encode = async (payload) => {
  return jwt.sign(payload, process.env.JWT_KEY);
};

module.exports = encode;
