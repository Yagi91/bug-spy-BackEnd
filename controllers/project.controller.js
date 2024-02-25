const Project = require("../models/project.model");
const extend = require("lodash/extend");
const errorHandler = require("../helpers/dbErrorHandler");
const debug = require("debug")("bug-spy:project.controller.js");

const create = async (req, res) => {
  debug("in create", req.body.members);
  const ProjectExist = await Project.exists({ name: req.body.name });
  if (ProjectExist) {
    return res
      .status(400)
      .json({ error: "A Project with this name already available" });
  }
  const project = new Project(req.body);
  try {
    await project.save();
    debug("Successfully created", project);
    return res.status(200).json({
      name: project.name,
      _id: project._id,
      progress: project.progress,
      admin: project.admin,
      totalBugs: project.totalBugs,
      created: project.created,
    });
  } catch (err) {
    debug("Error in creating project:", errorHandler.getErrorMessage(err));
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
  }
};

const list = async (req, res) => {
  debug("in list", req.body);
  try {
    const projects = await Project.find()
      .populate({
        path: "admin",
        select: "name _id",
      })
      .select("_id name admin totalBugs created description progress");
    return res.json(projects);
  } catch (err) {
    debug("Error in listing projects:", err);
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const projectByID = async (req, res, next, id) => {
  try {
    debug("in projectByID", id);
    let project = await Project.findById(id);
    if (!project || !id) {
      return res.status(404).json({
        error: "Project not found",
      });
    }
    req.project = project;
    next();
  } catch (err) {
    debug("Error in retrieving project", err);
    return res.status(400).json({
      error: "Could not retrieve user",
    });
  }
};

const projectByName = async (req, res, next, name) => {
  try {
    let project = await Project.findOne({ name: name });
    if (!project || !name) {
      return res.status(404).json({
        error: "Project not found",
      });
    }
    req.project = project;
    debug("in projectByName, successfully retrieved project", project);
    next();
  } catch (err) {
    debug("Error in retrieving project:", err);
    return res.status(400).json({
      error: "Could not retrieve user",
    });
  }
};

const read = async (req, res) => {
  try {
    const project = await Project.findById(req.project._id)
      .populate({
        path: "bugs",
        populate: {
          path: "assignee",
          select: "name _id",
        },
        select: "name description status priority status assignee created updated _id",
      })
      .populate({
        path: "members",
        select: "name _id role email",
      })
      .populate({
        path: "admin",
        select: "name _id",
      })
      .exec();

    if (!project) {
      return res.status("400").json({
        error: "Project not found",
      });
    }
    return res.json(project);
  } catch (err) {
    debug("Error in reading project");
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const update = async (req, res) => {
  try {
    debug("in updating project");
    let project = req.project;
    project = extend(project, req.body);
    project.updated = Date.now();
    await project.save();
    debug("updated project");
    res.json(project);
  } catch (err) {
    debug("Error in updating project:", errorHandler.getErrorMessage(err));
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const remove = async (req, res) => {
  debug("Removing Project");
  try {
    let project = req.project;
    let deletedProject = await Project.deleteOne({ _id: project._id });
    debug("deleted project");
    res.json(deletedProject); // an object with acknowledged and deletedCount keys
  } catch (err) {
    debug("Error in deleting project:", errorHandler.getErrorMessage(err));
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
