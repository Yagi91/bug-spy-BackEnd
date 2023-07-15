const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId;

// const UserSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     trim: true,
//     required: "Name is required",
//   },
//   id: {
//     type: String,
//     trim: true,
//     required: "ID is required",
//   },
// });

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
    type: [String],
  },
  bugs: {
    type: [ObjectId],
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

module.exports = mongoose.model("Project", ProjectSchema);
