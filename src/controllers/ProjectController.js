const Project = require("../models/Project");
const Ticket = require("../models/Ticket");

async function getAllProjects(req, res) {
  const projects = await Project.find()
    .populate("createdBy", "_id firstName lastName email")
    .populate("members", "firstName lastName")
    .lean();
  return res.status(200).json(projects);
}

async function createProject(req, res) {
  const { name, description, members } = req.body;
  const data = {
    name,
    description,
    members,
    createdBy: req.user.sub,
  };
  const existingProject = await Project.findOne({ name });
  if (existingProject) {
    return res.status(400).json({
      message: "A project with that name already exists.",
    });
  }
  const newProject = await Project.create(data);
  const savedProject = await newProject.save();
  return res.status(200).json({
    message: "Project successfully created",
    project: savedProject,
  });
}

async function getProjectById(req, res) {
  const { id } = req.params;

  const project = await Project.findById(id)
    .populate("createdBy", "_id firstName lastName email")
    .populate("members", "firstName lastName")
    .lean();
  if (!project) {
    return res.status(404).json({
      message: "Project not found",
    });
  }
  // get all the tickets for this project
  const tickets = await Ticket.find({ project: id })
    .populate("assignedTo", "email firstName lastName")
    .populate("createdBy", "email firstName lastName")
    .populate("project", "name");

  const openTickets = tickets.filter((ticket) => ticket.status != "closed");
  const closedTickets = tickets.filter((ticket) => ticket.status != "open");

  project.tickets = {
    openTickets,
    closedTickets,
  };

  return res.status(200).json(project);
}

async function removeProjectMember(req, res) {
  const { id } = req.params;
  const { memberId } = req.body;

  try {
    await Project.findByIdAndUpdate(id, {
      $pull: { members: memberId },
    });
  } catch (error) {
    return res.status(500).json({ message: "An error occured" });
  }
}

module.exports = {
  getAllProjects,
  createProject,
  getProjectById,
  removeProjectMember,
};
