const mongoose = require("mongoose");

const ObjectId = mongoose.Types.ObjectId;

// const UserSchema = new mongoose.Schema({
//   name: String,
//   id: ObjectId,
// });
const ProjectSchema = new mongoose.Schema({
  name: String,
  id: ObjectId,
});

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
  assignedTo: {
    type: ObjectId,
    // required: "Name of assigned developer required",
  },
  createdBy: {
    type: ObjectId,
    // required: "Name of creator required",
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
  },
});

BugSchema.pre("save", async function (next) {
  this.bugs = new ObjectId(this.project);
  next();
});

module.exports = mongoose.model("Bug", BugSchema);
