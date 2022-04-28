var express = require("express");
var router = express.Router();
const userController = require("../controller/user.Controller");
const authloginController = require("../controller/authLogin.Controller");
const { route } = require("express/lib/application");
/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

module.exports = router;
