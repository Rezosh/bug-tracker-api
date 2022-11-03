const {
  loginUser,
  registerUser,
  logoutUser,
} = require("../controllers/AuthController");
const router = require("express").Router();

router.post("/login", loginUser);
router.delete("/logout", logoutUser);
router.post("/register", registerUser);

module.exports = router;
