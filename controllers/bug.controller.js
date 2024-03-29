const Bug = require("../models/bug.model.js");
const Project = require("../models/project.model.js");
const extend = require("lodash/extend");
const errorHandler = require("../helpers/dbErrorHandler.js");
const User = require("../models/user.model.js");
const referenceSwap = require("../helpers/ReferenceSwap.js");
const debug = require("debug")("bug-spy:bug.controller.js");

const create = async (req, res) => {
  const bug = new Bug(req.body);
  const project = await Project.findById(req.body.project);
  const assignee = await User.findById(req.body.assignee);
  if (!project) {
    return res
      .status(400)
      .json({ error: "Referenced project-Id is incorrect" });
  }
  try {
    debug("in create", req.body);
    await bug.save();
    project.bugs.push(bug._id);
    project.totalBugs += 1;
    await project.save();
    assignee.bugs.push(bug._id);
    await assignee.save();
    debug("Bug successfully reported");
    return res.status(200).json(bug);
  } catch (err) {
    debug("Error in creating bug:", err);
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
  }
};

const list = async (req, res) => {
  try {
    const bugs = await Bug.find().select(
      "_id name description priority status project assignee updated created"
    );
    return res.json(bugs);
  } catch (err) {
    debug("Error in listing bugs:", err);
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const bugByID = async (req, res, next, id) => {
  debug("in bugByID", id);
  try {
    let bug = await Bug.findById(id);
    let project = await Project.findById(bug.project.toString());
    let assignee = await User.findById(bug.assignee.toString());
    if (!bug) {
      return res.status(404).json({
        error: "Bug not found",
      });
    }
    if (!project || !assignee)
      return res.status(400).json({
        error: "Invalid Bug, ID's not associated to any project or assignee",
      });

    req.bug = bug;
    req.project = project;
    req.assignee = assignee;
    next();
  } catch (err) {
    debug("Error in bugByID", err);
    return res.status(400).json({
      error: "Could not retrieve bug",
    });
  }
};

const read = (req, res) => {
  return res.json(req.bug);
};

const update = async (req, res) => {
  try {
    let bug = req.bug;
    let assignee = req.assignee;
    bug = extend(bug, req.body);
    bug.updated = Date.now();
    await bug.save();
    referenceSwap.referenceSwap(assignee, "bugs", bug.assignee, User);
    await assignee.save();
    debug("Bug successfully updated", bug);
    res.json(bug);
  } catch (err) {
    debug("Error in bug update:", err);
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const remove = async (req, res) => {
  try {
    let bug = req.bug;
    let project = req.project;
    let assignee = req.assignee;
    let updatedProjectBugs = project.bugs.filter(
      (_id) => bug.project.toString() !== _id.toString()
    );
    project.bugs = updatedProjectBugs;
    project.totalBugs -= 1;
    await project.save();
    let updatedAssigneeBugs = assignee.bugs.filter(
      (_id) => bug.project.toString() !== _id.toString()
    );
    assignee.bugs = updatedAssigneeBugs;
    await assignee.save();
    let deletedBug = await bug.remove();
    debug("Bug successfully deleted", deletedBug);
    res.json(deletedBug);
  } catch (err) {
    debug("Error in bug delete:", err);
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const listByAssignee = async (req, res) => {
  try {
    let assigneeId = req.params.assigneeId;
    //sort created populate project and replace it with name of project the select the fields
    let bugs = await Bug.find({ assignee: assigneeId })
      .populate({
        path: "project",
        select: "name",
      })
      .sort({ created: -1 })
      .select("_id name description priority status project updated created")
      .exec();

    debug("Bugs by assignee", bugs);
    res.json(bugs);
  } catch (err) {
    debug("Error in listing bugs by assignee:", err);
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

// .select("_id name description priority status project updated created");
module.exports = {
  create,
  list,
  bugByID,
  read,
  update,
  remove,
  listByAssignee,
};
