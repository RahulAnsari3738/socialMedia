var express = require("express");
var router = express.Router();
const adminController = require("../controller/admin.Controller");
const authloginController = require("../controller/authLogin.Controller");
const tokenVerify=require("../middleware/tokenVerify")
const { route } = require("express/lib/application");
/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});
router.post("/signup", adminController.signUp);
router.post("/signupverify", adminController.signupVerify);
router.post("/login", authloginController.adminLogin);
router.put("/update", tokenVerify,adminController.Update);
router.delete("/delete",tokenVerify, adminController.Delete);
router.post("/forget",tokenVerify, adminController.Forget);
router.put("/reset",tokenVerify, adminController.Reset);
// router.post("/friendRequest", adminController.friendRequest);
// router.post("/requestApprove", adminController.requestApprove);
module.exports = router;
