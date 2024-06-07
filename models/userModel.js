const { string } = require("joi");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    userName: {
      type: String,
    },

    email: {
      type: String,
      lowerCase: true,
    },
    password: {
      type: String,
    },
    phone: {
      type: Number,
    },

    role: {
      type: String,
      enum: ["admin", "superadmin"],
    },
    
    image:{
      type:[String],
    }





  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
