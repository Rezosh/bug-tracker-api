const Ticket = require("../models/Ticket");
const User = require("../models/User");

async function getAllUsers(req, res) {
  const users = await User.find().select("firstName lastName email role");
  return res.status(200).json(users);
}

async function getUserById(req, res) {
  const { id } = req.params;
  const user = await User.findById(id).select("firstName lastName email role");

  if (!user) return res.status(404).json({ message: "User not found" });
  return res.status(200).json(user);
}

async function updateUserRole(req, res) {
  const { id } = req.params;
  const { newRole } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.role = newRole;
  await user.save();

  return res.status(200).json({ message: "User role updated" });
}

async function getUserAssignedTickets(req, res) {
  const { sub } = req.user;
  const page = req.query.page ? parseInt(req.query.page) : 0;
  const PAGE_LIMIT = 5;

  const count = await Ticket.countDocuments({
    assignedTo: sub,
    status: "open",
  });
  const pages = Math.ceil(count / PAGE_LIMIT);

  const tickets = await Ticket.find({
    assignedTo: sub,
    status: "open",
  })
    .limit(PAGE_LIMIT)
    .skip(PAGE_LIMIT * page)
    .sort({ createdAt: 1 })
    .populate("project", "name");

  const response = {
    pages,
    tickets,
  };

  return res.status(200).json(response);
}

async function getUserTickets(req, res) {
  const { sub } = req.user;
  const page = req.query.page ? parseInt(req.query.page) : 0;
  const PAGE_LIMIT = 5;

  const count = await Ticket.countDocuments({ user: sub, status: "open" });
  const pages = Math.ceil(count / PAGE_LIMIT);

  const tickets = await Ticket.find({
    createdBy: sub,
    status: "open",
  })
    .limit(PAGE_LIMIT)
    .skip(PAGE_LIMIT * page)
    .sort({ createdAt: 1 })
    .populate("project", "name");

  const response = {
    pages,
    tickets,
  };

  return res.status(200).json(response);
}

module.exports = {
  getAllUsers,
  getUserById,
  getUserTickets,
  getUserAssignedTickets,
  updateUserRole,
};
