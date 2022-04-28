const fbModel = require("../models/user.Schema");
const rabbitNodemailer = require("../helper/nodeMailer&&RabbitMq");

const redis = require("redis");
const { json } = require("express/lib/response");
const client = redis.createClient({
  legacyMode: true,
});
client.connect();
class Admincontroller {
  signUp = async (req, res) => {
    try {
      const { fName, lName, emailId, phoneNumber, password } = req.body;
      console.log(req.body);
      if (!fName || !lName || !emailId || !phoneNumber || !password) {
        return res
          .status(400)
          .json({ message: "fill the field ", success: false });
      }
      const adminExist = await fbModel.findOne({ emailId: emailId });
      if (adminExist) {
        return res
          .status(400)
          .json({ message: "email is allready exist ", success: false });
      } else {
        var adminData = {};
        adminData[`${emailId}`] = Math.floor(Math.random() * 99999);
        console.log(adminData[`${emailId}`]);
        adminData["fName"] = `${fName}`;
        adminData["lName"] = `${lName}`;
        adminData["emailId"] = `${emailId}`;
        adminData["phoneNumber"] = `${phoneNumber}`;
        adminData["password"] = `${password}`;
        adminData["role"] = `${"admin"}`;
        adminData["sub"] = `${"signUp Verify"}`;
        client.setEx("adminData", 30, JSON.stringify(adminData));

        rabbitNodemailer.rabbit(adminData, emailId);
        return res
          .status(200)
          .json({ message: "verify mail send", success: true, adminData });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: e.message, success: false });
    }
  };

  signupVerify = async (req, res) => {
    try {
      const { otp } = req.body;
      console.log(req.body);
      if (!otp) {
        return res
          .status(400)
          .json({ message: "fill the field", success: false });
      }

      client.get("adminData", async (Error, data) => {
        if (Error) {
          throw Error;
        } else {
          const adminResult = JSON.parse(data);
          console.log(adminResult);
          if (adminResult === null) {
            return res
              .status(400)
              .json({ message: "to late for otp verify please sign back" });
          }

          const { fName, lName, emailId, phoneNumber, password, role } =
            adminResult;
          const oldOpt = JSON.stringify(adminResult[`${emailId}`]);

          if (otp === oldOpt) {
            const dataSave = new fbModel({
              fName: fName,
              lName: lName,
              emailId: emailId,
              phoneNumber: phoneNumber,
              password: password,
              role: role,
            });

            const finalResult = await dataSave.save();
            console.log(finalResult);
            return res
              .status(200)
              .json({ message: "admin register successfully", success: true });
          } else if (otp !== oldOpt) {
            return res
              .status(200)
              .json({ message: "otp not match", success: false });
          }
        }
      });
    } catch (e) {
      console.log(e.message);
    }
  };

  Update = async (req, res) => {
    try {
      const { emailId, phoneNumber, password, newPassword } = req.body;
      console.log(req.body);
      if ((!emailId && !phoneNumber) || !newPassword) {
        return res
          .status(400)
          .json({ message: "fill the field", success: false });
      }
      if (!password) {
        return res
          .status(400)
          .json({ message: "please fill the old password", success: false });
      }
      const findadmin = await fbModel.findOne({
        $or: [{ emailId: emailId }, { phoneNumber: phoneNumber }],
      });

      if (!findadmin) {
        return res
          .status(400)
          .json({ message: "admin not found", success: false });
      } else if (findadmin.password != password) {
        return res.status(403).json({
          message: "please enter the correct password",
          success: false,
        });
      } else if (findadmin.password === newPassword) {
        return res
          .status(400)
          .json({ message: "you enter the old password", success: false });
      } else {
        const id = findadmin._id;
        const updateadmin = await fbModel.findByIdAndUpdate(
          id,
          { password: newPassword },
          { new: true }
        );
        return res
          .status(200)
          .json({ message: "admin update successfully", success: true });
      }
    } catch (e) {
      console.log(e.message);
      return res.status(500).json({ message: e.message, success: false });
    }
  };

  Delete = async (req, res) => {
    try {
      const { emailId, phoneNumber, password } = req.body;
      console.log(req.body);
      if ((!emailId && !phoneNumber) || !password) {
        return res
          .status(400)
          .json({ message: "fill the field", success: false });
      }

      const findadmin = await fbModel.findOne({
        $or: [{ emailId: emailId }, { phoneNumber: phoneNumber }],
      });

      if (!findadmin) {
        return res
          .status(400)
          .json({ message: "admin not found", success: false });
      } else if (findadmin.password != password) {
        return res.status(403).json({
          message: "please enter the correct password",
          success: false,
        });
      } else {
        const id = findadmin._id;
        const updateadmin = await fbModel.findByIdAndDelete(id, { new: true });
        return res
          .status(200)
          .json({ message: "admin delete successfully", success: true });
      }
    } catch (e) {
      console.log(e.message);
      return res.status(500).json({ message: e.message, success: false });
    }
  };

  Forget = async (req, res) => {
    try {
      const { emailId } = req.body;
      if (!emailId) {
        return res
          .status(400)
          .json({ message: "fill the field", success: false });
      }
      const findadmin = await fbModel.findOne({ emailId: emailId });
      if (!findadmin) {
        return res
          .status(400)
          .json({ message: "admin not found", success: false });
      } else {
        var forgetData = {};
        forgetData[`${emailId}`] = Math.floor(Math.random() * 99999);

        forgetData[`sub`] = "Forget Password";
        console.log(forgetData);
        client.setEx("forgetData", 30, JSON.stringify(forgetData));
        rabbitNodemailer.rabbit(forgetData, emailId);

        return res.status(200).json({
          message: "email send successfully",
          success: true,
          otp: forgetData[`${emailId}`],
        });
      }
    } catch (e) {
      console.log(e.message);
      return res.status(500).json({ message: e.message, success: false });
    }
  };

  Reset = async (req, res) => {
    try {
      const { emailId, otp, newPassword } = req.body;
      // const oldOpt = JSON.stringify(globalData[`${emailId}`]);
      if (!emailId || !otp || !newPassword) {
        return res
          .status(400)
          .json({ message: "fill the field", success: false });
      }
      const findadmin = await fbModel.findOne({ emailId: emailId });
      if (!findadmin) {
        return res
          .status(400)
          .json({ message: "admin not found", success: false });
      }

      client.get("forgetData", async (Error, data) => {
        if (Error) {
          throw Error;
        } else {
          console.log(data);
          const dataResult = JSON.parse(data);
          if (dataResult === null) {
            return res.status(400).json({
              message: "to late for reset password please forget back",
              success: false,
            });
          }

          const oldOpt = JSON.stringify(dataResult[`${emailId}`]);
          console.log(oldOpt);

          if (otp === oldOpt) {
            const id = findadmin._id;

            const resetadmin = await fbModel.findByIdAndUpdate(
              id,
              { password: newPassword },
              { new: true }
            );
            return res
              .status(200)
              .json({ message: "admin reset successfully", success: true });
          } else {
            return res
              .status(400)
              .json({ message: "invalid credentials", success: false });
          }
        }
      });
    } catch (e) {
      console.log(e.message);
      return res.status(500).json({ message: e.message, success: false });
    }
  };
}
module.exports = new Admincontroller();
