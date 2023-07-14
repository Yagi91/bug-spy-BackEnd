const express = require("express");
const bugCtrl = require("../controllers/bug.controller");

const router = express.Router();

router.route("/api/bugs").get(bugCtrl.list).post(bugCtrl.create);

router
  .route("/api/bugs/:bugId")
  .get(bugCtrl.read)
  .put(bugCtrl.update)
  .delete(bugCtrl.remove);

router.param("bugId", bugCtrl.bugByID);

module.exports = router;
