const mongoose = require("../database/connection");

const userSchema = mongoose.Schema({
  fName: {
    type: String,
    require: true,
  },
  lName: {
    type: String,
    require: true,
  },
  emailId: {
    type: String,
    require: true,
  },
  phoneNumber: {
    type: Number,
    require: true,
  },

  password: {
    type: String,
    require: true,
  },
  friendRequest: [],
  friendList: [],
  role: {
    type: String,
    require: true,
  },
});

module.exports = new mongoose.model("fbModel", userSchema);
