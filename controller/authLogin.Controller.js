const fbModel = require("../models/user.Schema");
const tokenGenerator = require("../middleware/tokenGen");

class Authlogin {
  adminLogin = async (req, res) => {
    try {
      const { emailId, phoneNumber, password } = req.body;
      console.log(req.body);
      if ((!emailId && !phoneNumber) || !password) {
        return res.status(400).json({ message: "fill the field" });
      }
      const findAdmin = await fbModel.findOne({
        $or: [{ emailId: emailId }, { phoneNumber: phoneNumber }],
      });
      console.log(findAdmin);
      if (!findAdmin) {
        return res
          .status(400)
          .json({ message: "user not found", success: false });
      } else if (findAdmin.role != "admin") {
        return res
          .status(400)
          .json({ message: "you are not authorise user", success: false });
      } else if (password != findAdmin.password) {
        return res
          .status(400)
          .json({ message: "password not match", success: false });
      } else {
        const token = tokenGenerator(findAdmin);
        return res
          .status(200)
          .json({ message: "admin login", success: true, token });
      }
    } catch (e) {
      console.log(e.message);
      return res.status(500).json({ message: e.message, success: false });
    }
  };

  userLogin = async (req, res) => {
    try {
      const { emailId, phoneNumber, password } = req.body;
      console.log(req.body);
      if ((!emailId && !phoneNumber) || !password) {
        return res.status(400).json({ message: "fill the field" });
      }
      const findUser = await fbModel.findOne({
        $or: [{ emailId: emailId }, { phoneNumber: phoneNumber }],
      });
      console.log(findUser);
      if (!findUser) {
        return res
          .status(400)
          .json({ message: "user not found", success: false });
      } else if (findUser.role != "user") {
        return res
          .status(400)
          .json({ message: "you are not authorise user", success: false });
      } else if (password != findUser.password) {
        return res
          .status(400)
          .json({ message: "password not match", success: false });
      } else {
        const token = tokenGenerator(findUser);
        return res
          .status(200)
          .json({ message: "user login", success: true, token });
      }
    } catch (e) {
      console.log(e.message);
      return res.status(500).json({ message: e.message, success: false });
    }
  };
}

module.exports = new Authlogin();
