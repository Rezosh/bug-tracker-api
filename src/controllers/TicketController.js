const Ticket = require("../models/Ticket");
const Event = require("../models/Event");

async function getTickets(req, res) {
  const { projectId } = req.params;

  const page = req.query.page ? parseInt(req.query.page) : 0;
  const status = req.query.status ? req.query.status : null;

  const PAGE_LIMIT = 5;

  const count = await Ticket.countDocuments({
    project: projectId,
    status: status,
  });
  const pages = Math.ceil(count / PAGE_LIMIT);

  // if projectId is passed in, get tickets for that project
  if (projectId) {
    const tickets = await Ticket.find({ project: projectId, status: status })
      .populate("assignedTo", "email firstName lastName")
      .populate("createdBy", "email firstName lastName")
      .populate("project", "name")
      .limit(PAGE_LIMIT)
      .skip(PAGE_LIMIT * page)
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({ tickets, pages });
  }

  const tickets = await Ticket.find()
    .populate("createdBy", "firstName lastName email")
    .populate({ path: "assignedTo", select: "firstName lastName" })
    .populate("project", "name")
    .populate("tags")
    .lean();

  const openTickets = tickets.filter((ticket) => ticket.status === "open");
  const closedTickets = tickets.filter((ticket) => ticket.status === "closed");

  return res.status(200).json({
    openTickets,
    closedTickets,
  });
}

async function createTicket(req, res) {
  const { title, description, priority, project } = req.body;
  const data = {
    title,
    description,
    priority,
    project,
    status: "open",
    createdBy: req.user.sub,
  };

  const newTicket = await Ticket.create(data);
  const savedTicket = await newTicket.save();

  return res.status(200).json({
    message: "Ticket created",
    ticket: savedTicket,
  });
}

async function getTicketById(req, res) {
  const { ticketId } = req.params;
  const ticket = await Ticket.findById(ticketId)
    .populate("createdBy", ["_id", "firstName", "lastName"])
    .populate("project", "name")
    .populate("assignedTo", ["_id", "firstName", "lastName"])
    .populate({
      path: "comments",
      select: "text createdBy createdAt",
      populate: [
        {
          path: "createdBy",
          select: ["firstName", "lastName"],
        },
      ],
    })
    // populate tags from the project model
    .populate("tags", "name description color")

    .lean();
  return res.status(200).json(ticket);
}

async function updateTicket(req, res) {
  const { id } = req.params;
  const { field, value } = req.body;
  const ticket = await Ticket.findById(id);
  if (!ticket) {
    return res.status(404).json({
      message: "Ticket not found",
    });
  }

  if (
    req.user.sub !== ticket.createdBy.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(401).json({
      message: "You are not authorized to update this ticket",
    });
  }

  if (field === "status") {
    const action = value === "open" ? "opened" : "closed";
    ticket.status = value;
    const event = await Event.create({
      actor: req.user.sub,
      action,
      object: ticket._id,
      ticket: id,
      objectType: "Ticket",
    });
    await event.save();
    await ticket.save();
    return res.status(200).json({ message: "Ticket status updated" });
  }

  const updatedTicket = await Ticket.findByIdAndUpdate(
    id,
    { [field]: value },
    { new: true }
  );

  return res.status(200).json(updatedTicket);
}

async function deleteTicket(req, res) {
  const { ticketId } = req.body;

  try {
    await Ticket.findByIdAndDelete(ticketId);
    return res.status(200).json({ message: "Ticket successfully deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting ticket" });
  }
}

module.exports = {
  getTickets,
  createTicket,
  getTicketById,
  updateTicket,
  deleteTicket,
};
