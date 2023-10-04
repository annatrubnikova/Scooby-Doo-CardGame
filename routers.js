const express = require('express');
const router = express.Router();
const db = require('./db');
const path = require('path');

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
router.use("/win-page", db.win);
router.use("/lose-page", db.lose);
router.get("/", db.index);
router.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '/views/404.html'));
});
module.exports = router;