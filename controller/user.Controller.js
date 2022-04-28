const fbModel = require("../models/user.Schema");
const rabbitNodemailer = require("../helper/nodeMailer&&RabbitMq");

const redis = require("redis");
const { json } = require("express/lib/response");
const client = redis.createClient({
  legacyMode: true,
});
client.connect();
class Usercontroller {
  signUp = async (req, res) => {
    try {
      const { fName, lName, emailId, phoneNumber, password } = req.body;
      console.log(req.body);
      if (!fName || !lName || !emailId || !phoneNumber || !password) {
        return res
          .status(400)
          .json({ message: "fill the field ", success: false });
      }
      const userExist = await fbModel.findOne({ emailId: emailId });
      if (userExist) {
        return res
          .status(400)
          .json({ message: "email is allready exist ", success: false });
      } else {
        var userData = {};
        userData[`${emailId}`] = Math.floor(Math.random() * 99999);
        userData["fName"] = `${fName}`;
        userData["lName"] = `${lName}`;
        userData["emailId"] = `${emailId}`;
        userData["phoneNumber"] = `${phoneNumber}`;
        userData["password"] = `${password}`;
        userData["role"] = `${"user"}`;
        userData["sub"] = `${"signUp Verify"}`;
        client.setEx("userData", 30, JSON.stringify(userData));

        rabbitNodemailer.rabbit(userData, emailId);
        return res
          .status(200)
          .json({ message: "verify mail send", success: true, userData });
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

      client.get("userData", async (Error, data) => {
        if (Error) {
          throw Error;
        } else {
          const userResult = JSON.parse(data);
          console.log(userResult);
          if (userResult === null) {
            return res
              .status(400)
              .json({ message: "to late for otp verify please sign back" });
          }

          const { fName, lName, emailId, phoneNumber, password, role } =
            userResult;
          const oldOpt = JSON.stringify(userResult[`${emailId}`]);

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
              .json({ message: "user register successfully", success: true });
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
      const findUser = await fbModel.findOne({
        $or: [{ emailId: emailId }, { phoneNumber: phoneNumber }],
      });

      if (!findUser) {
        return res
          .status(400)
          .json({ message: "user not found", success: false });
      } else if (findUser.password != password) {
        return res.status(403).json({
          message: "please enter the correct password",
          success: false,
        });
      } else if (findUser.password === newPassword) {
        return res
          .status(400)
          .json({ message: "you enter the old password", success: false });
      } else {
        const id = findUser._id;
        const updateUser = await fbModel.findByIdAndUpdate(
          id,
          { password: newPassword },
          { new: true }
        );
        return res
          .status(200)
          .json({ message: "user update successfully", success: true });
      }
    } catch (e) {
      console.log(e);
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

      const findUser = await fbModel.findOne({
        $or: [{ emailId: emailId }, { phoneNumber: phoneNumber }],
      });

      if (!findUser) {
        return res
          .status(400)
          .json({ message: "user not found", success: false });
      } else if (findUser.password != password) {
        return res.status(403).json({
          message: "please enter the correct password",
          success: false,
        });
      } else {
        const id = findUser._id;
        const updateUser = await fbModel.findByIdAndDelete(id, { new: true });
        return res
          .status(200)
          .json({ message: "user delete successfully", success: true });
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
      const findUser = await fbModel.findOne({ emailId: emailId });
      if (!findUser) {
        return res
          .status(400)
          .json({ message: "user not found", success: false });
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
      const findUser = await fbModel.findOne({ emailId: emailId });
      if (!findUser) {
        return res
          .status(400)
          .json({ message: "user not found", success: false });
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
            const id = findUser._id;

            const resetUser = await fbModel.findByIdAndUpdate(
              id,
              { password: newPassword },
              { new: true }
            );
            return res
              .status(200)
              .json({ message: "user reset successfully", success: true });
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

  friendRequest = async (req, res) => {
    try {
      const { requestSend, requestReciver } = req.body;
      console.log(req.body);

      if (!requestSend || !requestReciver) {
        return res
          .status(400)
          .json({ message: "fill the field", success: false });
      }
      const friendExist1 = await fbModel.findOne({ _id: requestSend });

      if (!friendExist1) {
        return res
          .status(400)
          .json({ message: "sender not found", success: false });
      }

      const friendExist = await fbModel.findOne({
        _id: requestReciver,
      });

      if (!friendExist) {
        return res
          .status(400)
          .json({ message: "reciver not found", success: false });
      }
      console.log(friendExist.friendList);
      console.log(requestSend);

      for (let key in friendExist.friendList) {
        if (friendExist.friendList[key] == requestSend) {
          return res
            .status(400)
            .json({ message: "user is allready  your friend" });
        }
      }

      for (let key in friendExist.friendRequest) {
        if (friendExist.friendRequest[key] === requestSend) {
          return res.status(400).json({
            message: "you allready send the friendRequest",
            success: false,
          });
        }
      }
      const finalResult = await fbModel.findByIdAndUpdate(
        { _id: requestReciver },
        {
          $push: {
            friendRequest: requestSend,
          },
        },
        {
          set: true,
        }
      );
      return res
        .status(200)
        .json({ message: "friend request send", success: true });
    } catch (e) {
      console.log(e.message);
      return res.status(500).json({ message: e.message, success: false });
    }
  };

  requestApprove = async (req, res) => {
    try {
      const { requestDetails, requestReciver } = req.body;
      if (!requestDetails || !requestReciver) {
        return res
          .status(400)
          .json({ message: "fill the field", success: false });
      }

      const findReciver = await fbModel.findOne({ _id: requestReciver });

      for (let key in findReciver.friendList) {
        console.log(findReciver);
        console.log(findReciver.friendList + "list");
        if (findReciver.friendList[key] === requestDetails)
          return res
            .status(400)
            .json({ message: "user is allready your friend", success: false });
      }

      if (findReciver.friendRequest.length === 0) {
        return res.status(400).json({
          message: "requestDetail user not send friendRequest",
          success: false,
        });
      }

      const pullUser = await fbModel.findByIdAndUpdate(
        { _id: requestReciver },
        { $pull: { friendRequest: requestDetails } },
        {
          set: true,
        }
      );

      const pushUser = await fbModel.findByIdAndUpdate(
        { _id: requestReciver },
        {
          $push: {
            friendList: requestDetails,
          },
        },
        {
          set: true,
        }
      );

      const pushUser1 = await fbModel.findByIdAndUpdate(
        {
          _id: requestDetails,
        },
        {
          $push: {
            friendList: requestReciver,
          },
        },
        {
          set: true,
        }
      );
      return res.status(200).json({
        message: "friend request accepts",
        success: true,
      });
    } catch (e) {
      console.log(e.message);
      return res.status(500).json({ message: e.message, success: false });
    }
  };
}

module.exports = new Usercontroller();
