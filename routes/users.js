var express = require("express");
var router = express.Router();
const userController = require("../controller/user.Controller");
const authloginController = require("../controller/authLogin.Controller");
const tokenVerify = require("../middleware/tokenVerify");
const { route } = require("express/lib/application");
/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});
router.post("/signup", userController.signUp);
router.post("/signupverify", userController.signupVerify);
router.post("/login", authloginController.userLogin);
router.put("/update", tokenVerify,userController.Update);
router.delete("/delete", tokenVerify,userController.Delete);
router.post("/forget", tokenVerify,userController.Forget);
router.put("/reset", tokenVerify,userController.Reset);
router.post("/friendRequest", tokenVerify,userController.friendRequest);
router.post("/requestApprove", tokenVerify,userController.requestApprove);
module.exports = router;
