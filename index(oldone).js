const express = require('express');
const db = require('./db');
const app = express();
//const userRouter = express.Router();
const session = require('express-session');
const http = require('http');
const socketio = require('socket.io');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({secret: 'hsjhjgkdfjgksj', saveUninitialized: true, resave: true, user: {}}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(express.static('public'));
app.use(express.static('images'));
app.use('/', express.static('views'));

app.post("/create", db.addUser);
app.post("/validate", db.addUser);
app.use("/home", db.home);
app.use("/settings", db.settings);
app.use("/stats", db.stats);
//app.use("/user", userRouter);
//app.use("/done", db.done);
app.get("/logout", db.logout);
app.get("/signUp", db.register);
app.use("/reminder", db.reminder);
app.use("/signIn", db.login);
app.use("/", db.index);

app.use(function (req, res, next) {
    res.status(404).send("Not Found");
});


const port = process.env.PORT || 3000;
const host = '127.0.0.1';

app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});