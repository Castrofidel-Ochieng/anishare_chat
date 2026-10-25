const express = require("express");
const controller = require("../controllers/messageController");

const router = express.Router();
router.get("/:room", controller.listMessages);

module.exports = router;
