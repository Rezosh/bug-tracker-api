const checkJwt = require("../middleware/jwtMiddleware");
const { attachUser, requireAdmin } = require("../middleware/User");
const {
  getAllUsers,
  getUserTickets,
  getUserAssignedTickets,
  updateUserRole,
  getUserById,
} = require("../controllers/UserController");
const router = require("express").Router();

router.use(attachUser);
router.use(checkJwt);

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.get("/me/tickets", getUserTickets);
router.get("/me/tickets/assigned", getUserAssignedTickets);
router.patch("/:id/role", requireAdmin, updateUserRole);

module.exports = router;
