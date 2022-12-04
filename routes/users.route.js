const express = require("express");
const router = express.Router();

// Importing users controller
const usersCtrl = require("../controllers/users.controller");
const usersMiddleware = require("../middleware/users.middleware")

router.post("/create", usersMiddleware.isInputValidated, usersCtrl.createUser)
router.get("/all", usersCtrl.getAllUsers)
router.get("/:id", usersCtrl.getUserByID)
router.put("/:id", usersCtrl.updateUser)
router.delete("/:id", usersCtrl.deleteUser)

module.exports = router;