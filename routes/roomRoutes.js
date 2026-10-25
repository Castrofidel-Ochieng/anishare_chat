const express = require("express");
const controller = require("../controllers/roomController");

const router = express.Router();
router.get("/", controller.listRooms);
router.post("/", express.json(), controller.ensureRoom);

module.exports = router;
