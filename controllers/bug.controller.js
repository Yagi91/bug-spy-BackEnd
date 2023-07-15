const Bug = require("../models/bug.model.js");
const Project = require("../models/project.model.js");
const extend = require("lodash/extend");
const errorHandler = require("../helpers/dbErrorHandler.js");

const create = async (req, res) => {
  console.log("in create");
  // req.body.project = ObjectId(req.body.project);
  const bug = new Bug(req.body);
  const project = await Project.findById(req.body.project);
  if (!project) {
    return res
      .status(400)
      .json({ error: "Referenced project-Id is incorrect" });
  }
  try {
    await bug.save();
    project.bugs.push(bug._id);
    project.totalBugs += 1;
    await project.save();
    console.log(bug);
    return res.status(200).json({
      message: "Bug created successfully",
      bug,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: errorHandler(err) });
  }
};

const list = async (req, res) => {
  try {
    const bugs = await Bug.find().select(
      "_id name description priority status project assignedTo updated created"
    );
    return res.json(bugs);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

const bugByID = async (req, res, next, id) => {
  try {
    let bug = await Bug.findById(id);
    let project = await Project.findById(bug.project.toString());
    if (!bug) {
      return res.status(404).json({
        error: "Bug not found",
      });
    }
    if (!project)
      return res.status(400).json({
        error: "Invalid Bug, not associated to any project, Contact support",
      });

    req.bug = bug;
    req.project = project;
    next();
  } catch (err) {
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
    bug = extend(bug, req.body);
    bug.updated = Date.now();
    await bug.save();
    res.json(bug);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

const remove = async (req, res) => {
  try {
    let bug = req.bug;
    let project = req.project;
    let updatedProjectBugs = project.bugs.filter(
      (_id) => bug.project.toString() !== _id.toString()
    );
    project.bugs = updatedProjectBugs;
    project.totalBugs -= 1;
    await project.save();
    let deletedBug = await bug.remove();
    res.json(deletedBug);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

module.exports = {
  create,
  list,
  bugByID,
  read,
  update,
  remove,
};
