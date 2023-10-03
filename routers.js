const express = require('express');
const router = express.Router();
const db = require('./db');

router.get('/room_chat', db.chatPage);
router.post("/create", db.addUser);
router.post("/validate", db.addUser);
router.use("/home", db.home);
router.use("/settings", db.settings);
router.use("/stats", db.stats);
router.get("/logout", db.logout);
router.get("/signUp", db.register);
router.use("/reminder", db.reminder);
router.use("/signIn", db.login);
router.post("/delete", db.delete);
router.use("/", db.index);

module.exports = router;