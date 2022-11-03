const User = require("../models/User");
const {
  hashPassword,
  createToken,
  validatePassword,
} = require("../utils/utils");
const jwtDecode = require("jwt-decode");

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(403).json({ message: "Wrong email or password." });
    }

    const passwordValid = await validatePassword(password, user.password);
    if (passwordValid) {
      const { password, ...rest } = user;
      const userInfo = Object.assign({}, { ...rest });
      const token = createToken(rest);
      const decodedToken = jwtDecode(token);
      const expiresAt = decodedToken.exp;

      // send token in cookie
      res.cookie("token", token, {
        httpOnly: true,
      });

      return res.status(200).json({
        message: "Login successful",
        token,
        expiresAt,
        userInfo,
      });
    } else {
      return res.status(403).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function logoutUser(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "There was an error logging out" });
    }
    return res.status(200).json({ message: "Logout successful" });
  });
}

async function registerUser(req, res) {
  try {
    const { email, password, firstName, lastName } = req.body;

    const userAlreadyExists = await User.findOne({ email }).lean();
    if (userAlreadyExists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
    });
    const savedUser = await newUser.save();

    if (savedUser) {
      const { email, firstName, lastName, role } = savedUser;
      const userInfo = { email, firstName, lastName, role };

      return res.status(200).json({
        message: "User created successfully",
        userInfo,
      });
    } else {
      return res.status(500).json({ message: "Error creating user" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error creating user" });
  }
}

module.exports = {
  loginUser,
  registerUser,
  logoutUser,
};
