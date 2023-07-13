const express = require("express");
const projectCtrl = require("../controllers/project.controller");

const router = express.Router();

router.route("/api/projects").get(projectCtrl.list).post(projectCtrl.create);

router
  .route("/api/users/projects/:projectId")
  .get(projectCtrl.read)
  .put(projectCtrl.update)
  .delete(projectCtrl.remove);

router.param("projectId", projectCtrl.projectByID);

module.exports = router;
