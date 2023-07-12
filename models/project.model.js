const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: "Project name is required",
  },
  description: {
    type: String,
    trim: true,
    required: "Description is required",
  },
  progress: {
    type: String,
    enum: ["Completed", "Ongoing"],
    default: "Ongoing",
    required: "Current Project Progress is required",
  },
  admin: {
    type: String,
    required: "Name of project admin required",
  },
  members: {
    type: [String],
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
  },
});

module.exports = mongoose.model("Project", ProjectSchema);
