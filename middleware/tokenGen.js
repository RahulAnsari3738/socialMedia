const seckretKet = require("../config/token.json");
const jwt = require("jsonwebtoken");

module.exports = (data) => {
  const token = jwt.sign({ data }, seckretKet.unique);
  return token;
};
