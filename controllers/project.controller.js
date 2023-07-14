const Project = require("../models/project.model");
const extend = require("lodash/extend");
const errorHandler = require("../helpers/dbErrorHandler");

const create = async (req, res) => {
  console.log("in create");
  const ProjectExist = await Project.exists({ name: req.body.name });
  if (ProjectExist) {
    return res
      .status(400)
      .json({ error: "A Project with this name already available" });
  }
  const project = new Project(req.body);
  try {
    await project.save();
    console.log(project);
    return res.status(200).json({
      message: "Project created successfully",
      project,
    });
  } catch (err) {
    return res.status(400).json({ error: errorHandler(err) });
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
      error: errorHandler(err),
    });
  }
};

const projectByID = async (req, res, next, id) => {
  try {
    let project = user.findByID(id);
    if (!user) {
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

const read = (req, res) => {
  return res.json(req.project);
};

const update = async (req, res) => {
  try {
    let project = req.project;
    project = extend(project, req.body);
    project.updated = Date.now();
    await user.save();
    res.json(project);
  } catch (err) {
    return res.status(400).json({
      error: "Could not retrieve user",
    });
  }
};

const remove = async (req, res) => {
  console.log("in remove", req.body);
  try {
    let project = req.project;
    let deletedProject = await Project.deleteOne({ _id: project._id });
    res.json(deletedProject);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

module.exports = {
  create,
  projectByID,
  read,
  list,
  remove,
  update,
};
