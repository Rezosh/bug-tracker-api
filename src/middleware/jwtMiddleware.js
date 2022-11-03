const jwt = require("express-jwt/lib");

const checkJwt = jwt({
  secret: process.env.JWT_SECRET,
  getToken: (req) => req.cookies.token,
  issuer: "api.bugtracker",
  audience: "api.bugtracker",
  algorithms: ["HS256"],
});

module.exports = checkJwt;
