const express = require('express');
const db = require('./db');
const app = express();
const userRouter = express.Router();
const session = require('express-session');


app.use(session({secret: 'hsjhjgkdfjgksj', saveUninitialized: true, resave: true, user: {}}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(express.static('public'));
app.use(express.static('images'));
app.use('/', express.static('views'));

userRouter.post("/create", db.addUser);
userRouter.post("/validate", db.addUser);
userRouter.use("/home", db.home);
app.use("/user", userRouter);
//app.use("/done", db.done);
app.get("/logout", db.logout);
app.get("/signUp", db.register);
//app.use("/reminder", db.reminder);
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