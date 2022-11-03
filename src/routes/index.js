const router = require("express").Router();
const auth = require("./auth");
const tickets = require("./tickets");
const projects = require("./projects");
const users = require("./users");
const dashboard = require("./dashboard");

router.use("/auth", auth);
router.use("/tickets", tickets);
router.use("/projects", projects);
router.use("/users", users);
router.use("/dashboard", dashboard);

module.exports = router;
