const Project = require("../models/Project");
const Ticket = require("../models/Ticket");
const User = require("../models/User");

async function getAdminData(req, res) {
  const projectCount = await Project.countDocuments();
  const openTicketCount = await Ticket.count({ status: "open" });
  const userCount = await User.countDocuments();

  const lowPriorityTickets = await Ticket.count({
    status: "open",
    priority: "low",
  });
  const mediumPriorityTickets = await Ticket.count({
    status: "open",
    priority: "medium",
  });
  const highPriorityTickets = await Ticket.count({
    status: "open",
    priority: "high",
  });

  const projectNames = await Project.find().select("name");
  const ticketsByProject = [];
  for (let i = 0; i < projectNames.length; i++) {
    const projectId = projectNames[i]._id;
    const projectName = projectNames[i].name;
    const tickets = await Ticket.count({
      status: "open",
      project: projectId,
    });
    ticketsByProject.push({
      projectName,
      tickets,
    });
  }

  const pieChartData = {
    labels: ["Low", "Medium", "High"],
    datasets: [
      {
        label: "Tickets Per Priority",
        data: [lowPriorityTickets, mediumPriorityTickets, highPriorityTickets],
        backgroundColor: ["#3182CE20", "#D69E2E20", "#FC818120"],
        borderColor: ["#3182CE", "#D69E2E", "#FC8181"],
        borderWidth: 1,
      },
    ],
  };

  const doughnutChartData = {
    labels: ticketsByProject.map((project) => project.projectName),
    datasets: [
      {
        label: "Tickets Per Project",
        data: ticketsByProject.map((project) => project.tickets),
        backgroundColor: [
          "#805AD520",
          "#D53F8C20",
          "#00B5D820",
          "#31979520",
          "#38A16920",
          // add random colors
        ],
        borderColor: ["#805AD5", "#D53F8C", "#00B5D8", "#319795", "#38A169"],
        borderWidth: 1,
      },
    ],
  };

  return res.status(200).json({
    projectCount,
    openTicketCount,
    userCount,
    pieChartData,
    doughnutChartData,
  });
}

async function getUserData(req, res) {
  const userId = req.user.sub;
  const usersOpenTickets = await Ticket.count({
    createdBy: userId,
    status: "open",
  });

  const usersClosedTickets = await Ticket.count({
    createdBy: userId,
    status: "closed",
  });

  const usersAssignedTickets = await Ticket.count({
    assignedTo: userId,
    status: "open",
  });

  const usersProjects = await Project.find({
    members: userId,
  })
    .select("name description members")
    .populate("members");

  return res.status(200).json({
    usersOpenTickets,
    usersClosedTickets,
    usersAssignedTickets,
    usersProjects,
  });
}

module.exports = {
  getAdminData,
  getUserData,
};
