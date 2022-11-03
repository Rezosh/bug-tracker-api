const checkJwt = require("../middleware/jwtMiddleware");
const { attachUser } = require("../middleware/User");
const {
  createProject,
  getAllProjects,
  getProjectById,
  removeProjectMember,
} = require("../controllers/ProjectController");
const router = require("express").Router();

const tagsRouter = require("./tags");
const ticketsRouter = require("./tickets");

router.use(attachUser);
router.use(checkJwt);

router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.post("/", createProject);
router.delete("/:id/member", removeProjectMember);

router.use("/:id/tags", tagsRouter);
router.use("/:projectId/tickets", ticketsRouter);

module.exports = router;
