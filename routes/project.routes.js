const express = require("express");
const projectCtrl = require("../controllers/project.controller");
const authCtrl = require("../controllers/auth.controller");

const router = express.Router();

router.route("/api/projects").get(projectCtrl.list).post(projectCtrl.create);

router
  .route("/api/projects/:projectId")
  .get(projectCtrl.read)
  .put(projectCtrl.update)
  .delete(projectCtrl.remove);

router.route("/api/projects/details/:projectName").get(projectCtrl.read);

router.param("projectId", projectCtrl.projectByID);
router.param("projectName", projectCtrl.projectByName);

module.exports = router;
