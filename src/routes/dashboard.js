const router = require("express").Router();
const checkJwt = require("../middleware/jwtMiddleware");
const { attachUser, requireAdmin } = require("../middleware/User");

const {
  getAdminData,
  getUserData,
} = require("../controllers/DashboardController");

router.use(attachUser);
router.use(checkJwt);

router.get("/admin-data", requireAdmin, getAdminData);
router.get("/user-data", getUserData);

module.exports = router;
