const { attachUser } = require("../middleware/User");
const checkJwt = require("../middleware/jwtMiddleware");

const router = require("express").Router({ mergeParams: true });
const {
  getTags,
  deleteTag,
  createTag,
} = require("../controllers/TagController");

router.use(attachUser);
router.use(checkJwt);

router.get("/", getTags);
router.delete("/", deleteTag);
router.post("/", createTag);

module.exports = router;
