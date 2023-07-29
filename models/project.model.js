const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId;

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
  },
  admin: {
    type: String,
    required: "Admin name is required",
  },
  members: {
    type: [ObjectId],
    ref: "User",
  },
  bugs: {
    type: [ObjectId],
    ref: "Bug",
  },
  totalBugs: {
    type: Number,
    default: 0,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
  },
});

ProjectSchema.pre("save", async function (next) {
  this.bugs = new ObjectId(this.bugs);
  next();
});

module.exports = mongoose.model("Project", ProjectSchema);
