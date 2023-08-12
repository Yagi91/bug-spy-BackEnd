const express = require("express");
const bugCtrl = require("../controllers/bug.controller");
const authCtrl = require("../controllers/auth.controller");

const router = express.Router();

router.route("/api/bugs").get(bugCtrl.list).post(bugCtrl.create);

//The listBugsByUser route will be used to retrieve all bugs assigned to a user. The listBugsByUser method in the controller will query the Bug model to find all bugs where the assignee field matches the userId in the request.
router
  .route("/api/bugs/:assigneeId")
  .get(authCtrl.requireSignin, bugCtrl.listByAssignee);

router
  .route("/api/bugs/:bugId")
  .get(authCtrl.requireSignin, bugCtrl.read)
  .put(authCtrl.requireSignin, bugCtrl.update)
  .delete(authCtrl.requireSignin, bugCtrl.remove);

router.param("bugId", bugCtrl.bugByID);

module.exports = router;
