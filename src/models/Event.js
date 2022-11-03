const mongoose = require("mongoose");

const Event = new mongoose.Schema({
  // Person that fires the event (author)
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // The ticket it is related to
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ticket",
    required: true,
  },

  // Action they do (e.g. 'created', 'updated', 'deleted')
  action: {
    type: String,
    required: true,
    enum: [
      "created",
      "assigned",
      "unassigned",
      "edited",
      "closed",
      "reopened",
      "commented",
      "tagged",
      "untagged",
    ],
  },

  // Object that the event refers to (e.g. 'Ticket.assignedTo', 'Tags', 'Comments', etc.)
  object: [
    {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "objectType",
      required: true,
    },
  ],

  // Type of object that the event refers to (e.g. 'Ticket', 'Tag', 'Comment', etc.)
  objectType: {
    type: String,
    required: true,
    enum: ["Ticket", "Tag", "Comment", "User", "Project"],
  },

  // Timestamp of the event
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Event", Event);
