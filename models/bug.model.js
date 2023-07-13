const mongoose = require("mongoose");

const BugSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: "Bug name is required",
  },
  description: {
    type: String,
    trim: true,
    required: "Description is required",
  },
  priority: {
    type: String,
    enum: ["High", "Medium", "Low"],
    default: "Low",
    required: "Priority is required",
  },
  status: {
    type: String,
    enum: ["Open", "Closed"],
    default: "Open",
    required: "Status is required",
  },
  project: {
    type: String,
    required: "Project name is required",
  },
  assignedTo: {
    type: String,
    required: "Name of assigned developer required",
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
  },
});

module.exports = mongoose.model("Bug", BugSchema);
