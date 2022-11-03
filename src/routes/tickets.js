const checkJwt = require("../middleware/jwtMiddleware");
const { attachUser } = require("../middleware/User");
const router = require("express").Router({ mergeParams: true });
const Ticket = require("../models/Ticket");
const Comment = require("../models/Comment");
const Event = require("../models/Event");
const {
  getTickets,
  createTicket,
  getTicketById,
  updateTicket,
  deleteTicket,
} = require("../controllers/TicketController");

router.use(attachUser);
router.use(checkJwt);

router.get("/", getTickets);
router.post("/", createTicket);
router.get("/:ticketId", getTicketById);
router.patch("/:id", updateTicket);
router.delete("/", deleteTicket);

/* FIXME: Simplify the process of commenting and creating events for the activity feed on the client side. 
The database aspect of this feature is to complex to implement. 
*/
router.post("/:id/comments", async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  const newComment = await Comment.create({
    text: comment,
    createdBy: req.user.sub,
    ticket: id,
  });
  const savedComment = await newComment.save();
  const event = await Event.create({
    actor: req.user.sub,
    action: "commented",
    object: savedComment._id,
    ticket: id,
    objectType: "Comment",
  });
  await event.save();
  await Ticket.findByIdAndUpdate(
    id,
    { $push: { comments: savedComment._id } },
    { new: true }
  );

  return res.status(200).json({
    message: "Comment added",
  });
});

router.post("/:id/assign", async (req, res) => {
  const { id } = req.params;
  const { assignedUsers } = req.body;

  if (assignedUsers.length === 0) {
    return res.status(400).json({
      message: "No users selected",
    });
  }

  const event = await Event.create({
    actor: req.user.sub,
    action: "assigned",
    object: assignedUsers,
    ticket: id,
    objectType: "User",
  });

  await event.save();

  const promises = assignedUsers.map(async (assignee) => {
    await Ticket.findByIdAndUpdate(id, { $push: { assignedTo: assignee } });
  });

  await Promise.all(promises);

  return res.status(200).json({
    message: "User(s) assigned",
  });
});

router.post("/:id/tags", async (req, res) => {
  const { id } = req.params;
  const { tagsAdded } = req.body;

  if (tagsAdded.length === 0) {
    return res.status(400).json({
      message: "No tags to add",
    });
  }

  const event = await Event.create({
    actor: req.user.sub,
    action: "tagged",
    object: tagsAdded,
    ticket: id,
    objectType: "Tag",
  });

  await event.save();

  const promises = tagsAdded.map(async (tag) => {
    await Ticket.findByIdAndUpdate(id, { $push: { tags: tag } });
  });

  await Promise.all(promises);

  return res.status(200).json({
    message: "Tag(s) added",
  });
});

// delete a tag from a ticket
router.delete("/:id/tags", async (req, res) => {
  const { id } = req.params;
  const { tagId } = req.body;

  try {
    await Ticket.findByIdAndUpdate(id, { $pull: { tags: tagId } });
  } catch (error) {
    return res.status(500).json({
      message: "Error removing tag",
    });
  }

  const event = await Event.create({
    actor: req.user.sub,
    action: "untagged",
    object: tagId,
    ticket: id,
    objectType: "Tag",
  });

  await event.save();

  return res.status(200).json({
    message: "Tag(s) removed",
  });
});

router.delete("/:id/assign", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  const event = await Event.create({
    actor: req.user.sub,
    action: "unassigned",
    object: userId,
    ticket: id,
    objectType: "User",
  });

  await event.save();

  await Ticket.findByIdAndUpdate(id, {
    $pull: { assignedTo: userId },
  });

  return res.status(200).json({
    message: "User unassigned",
  });
});

router.get("/:id/events", async (req, res) => {
  const { id } = req.params;

  const events = await Event.find({ ticket: id })
    .populate("actor", "firstName lastName")
    .populate("object")
    .lean();

  return res.status(200).json({
    events,
  });
});

module.exports = router;
