const Project = require("../models/project.model");
const extend = require("lodash/extend");
const errorHandler = require("../helpers/dbErrorHandler");

const create = async (req, res) => {
  console.log("in create", req.body.memebers);
  const ProjectExist = await Project.exists({ name: req.body.name });
  if (ProjectExist) {
    return res
      .status(400)
      .json({ error: "A Project with this name already available" });
  }
  const project = new Project(req.body);
  try {
    await project.save();
    console.log("Successfully created", project);
    return res.status(200).json({
      name: project.name,
      _id: project._id,
      progress: project.progress,
      admin: project.admin,
      totalBugs: project.totalBugs,
      created: project.created,
    });
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
  }
};

const list = async (req, res) => {
  try {
    const projects = await Project.find().select(
      "_id name admin totalBugs created description progress"
    );
    return res.json(projects);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const projectByID = async (req, res, next, id) => {
  try {
    let project = await Project.findById(id);
    console.log("retrieved project", project);
    if (!project) {
      res.status(404).json({
        error: "Project not found",
      });
    }
    req.project = project;
    next();
  } catch (err) {
    return res.status(400).json({
      error: "Could not retrieve user",
    });
  }
};
const projectByName = async (req, res, next, name) => {
  try {
    let project = await Project.findOne({ name: name });
    console.log("retrieved project", project);
    if (!project) {
      res.status(404).json({
        error: "Project not found",
      });
    }
    req.project = project;
    next();
  } catch (err) {
    return res.status(400).json({
      error: "Could not retrieve user",
    });
  }
};

const read = async (req, res) => {
  const project = await Project.findOne({ _id: req.project._id })
    .populate({
      path: "bugs",
      // populate: {
      //   path: "assignedTo",
      //   select: "name",
      // },
      select: "name description status priority status created updated _id",
    })
    .populate({
      path: "members",
      select: "name _id role",
    })
    .exec();

  return res.json(project);
};

const update = async (req, res) => {
  try {
    let project = req.project;
    project = extend(project, req.body);
    project.updated = Date.now();
    await project.save();
    res.json(project);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const remove = async (req, res) => {
  console.log("in remove", req.body);
  try {
    let project = req.project;
    let deletedProject = await Project.deleteOne({ _id: project._id });
    res.json(deletedProject); // an object with acknowledged and deletedCount keys
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

module.exports = {
  create,
  projectByID,
  projectByName,
  read,
  list,
  remove,
  update,
};
