const amqp = require("amqplib/callback_api");
const res = require("express/lib/response");
const nodemailer = require("nodemailer");
class Rabbitnodemailer {
  rabbit = async (userData, emailId) => {
    try {
      const otp = userData[`${emailId}`];
      const sub = userData[`sub`];

      amqp.connect("amqp://localhost", (connError, connection) => {
        if (connError) {
          throw connError;
        }
        // sender
        connection.createChannel((chError, channel) => {
          if (chError) {
            throw chError;
          }

          const data = {
            emailId: `${emailId}`,
            otp: `${otp}`,
            sub: `${sub}`,
          };
          const newData = JSON.stringify(data);

          const QUEUE = "mail";
          channel.assertQueue(QUEUE);
          channel.sendToQueue(QUEUE, Buffer.from(newData));
        });

        // reciver
        connection.createChannel((chError, channel) => {
          if (chError) {
            throw chError;
          }

          const QUEUE = "mail";
          channel.assertQueue(QUEUE);
          channel.consume(
            QUEUE,
            (msg) => {
              const result = msg.content.toString();
              const mailData = JSON.parse(result);
              // console.log(mailData);
              const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  user: "",
                  pass: "",
                },
              });

              const mailOption = {
                from: "",
                to: `${mailData.emailId}`,
                subject: `${mailData.sub}`,
                text: `your OTP code is ${mailData.otp}`,
              };

              const mail = transporter.sendMail(mailOption);
            },
            {
              noAck: true,
            }
          );
        });
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: e.message, success: false });
    }
  };
}
module.exports = new Rabbitnodemailer();
