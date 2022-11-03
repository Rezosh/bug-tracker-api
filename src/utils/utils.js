const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function createToken(user) {
  if (!user.role) {
    throw new Error("User role is not defined");
  }

  return jwt.sign(
    {
      sub: user._id,
      email: user.email,
      role: user.role,
      iss: "api.bugtracker",
      aud: "api.bugtracker",
    },
    process.env.JWT_SECRET,
    { algorithm: "HS256", expiresIn: "1h" }
  );
}

function validatePassword(password, userPassword) {
  return bcrypt.compare(password, userPassword);
}

function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

module.exports = {
  validatePassword,
  hashPassword,
  createToken,
};
