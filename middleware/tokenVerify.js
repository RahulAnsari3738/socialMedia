const jwt = require("jsonwebtoken");
const secretKey = require("../config/token");
module.exports = async (req, res, next) => {
  try {
    console.log(req.headers);
    const bear = req.headers.authorization.split(" ")[1];
    console.log(bear);
    const decoded = await jwt.verify(bear, secretKey.unique);
    console.log(decoded);
    const role = decoded.data.role;
    if (!decoded) {
      return res.json({ message: "Your are not Authorize User" });
    } else if (role === "user" || role === "admin") {
      req.user = decoded;
      return next();
    }
  } catch (e) {
    return res
      .status(404)
      .json({ message: "account not found", success: false });
  }
};
