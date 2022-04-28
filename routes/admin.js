var express = require("express");
var router = express.Router();
const adminController = require("../controller/admin.Controller");
const authloginController = require("../controller/authLogin.Controller");
const { route } = require("express/lib/application");
/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});
router.post("/signup", adminController.signUp);
router.post("/signupverify", adminController.signupVerify);
router.post("/login", authloginController.adminLogin);
router.put("/update", adminController.Update);
router.delete("/delete", adminController.Delete);
router.post("/forget", adminController.Forget);
router.put("/reset", adminController.Reset);
// router.post("/friendRequest", adminController.friendRequest);
// router.post("/requestApprove", adminController.requestApprove);
module.exports = router;
