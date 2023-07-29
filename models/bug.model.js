const mongoose = require("mongoose");

const ObjectId = mongoose.Types.ObjectId;

// const UserSchema = new mongoose.Schema({
//   name: String,
//   id: ObjectId,
// });
// const ProjectSchema = new mongoose.Schema({
//   name: String,
//   id: ObjectId,
// });

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
    required: "Referenced project id is required",
  },
  assignee: {
    type: ObjectId,
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

BugSchema.set("validateBeforeSave", false);

BugSchema.pre("save", async function (next) {
  console.log("in here");
  this.bugs = new ObjectId(this.project);
  this.assignee = new ObjectId(this.assignee);
  this.priority =
    this.priority[0].toUpperCase() + this.priority.slice(1).toLowerCase();
  this.status =
    this.status[0].toUpperCase() + this.status.slice(1).toLowerCase();
  console.log("bug status", this.status);
  this.validate();
  next();
});

module.exports = mongoose.model("Bug", BugSchema);
