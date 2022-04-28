var express = require("express");
var router = express.Router();
const userController = require("../controller/user.Controller");
const authloginController = require("../controller/authLogin.Controller");
const { route } = require("express/lib/application");
/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});
router.post("/signup", userController.signUp);
router.post("/signupverify", userController.signupVerify);
router.post("/login", authloginController.userLogin);
router.put("/update", userController.Update);
router.delete("/delete", userController.Delete);
router.post("/forget", userController.Forget);
router.put("/reset", userController.Reset);
router.post("/friendRequest", userController.friendRequest);
router.post("/requestApprove", userController.requestApprove);
module.exports = router;
