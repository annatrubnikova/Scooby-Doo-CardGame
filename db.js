const User = require('./models/user');
const fs = require('fs');
const crypt = require('bcryptjs');
const nodemailer = require("nodemailer");
const shortid = require("shortid");

function render(file, insert) {
    try {
        const eror = fs.readFileSync(__dirname + `/views/${file}.html`, 'utf-8');
        return eror.replace("#TEXT#", insert || '');
    } catch (err) {
        console.error(err);
    }
    return false;
}

async function validate(check) {
    const user = new User();
    const emailResult = await user.getList({ email: check.email });
    const loginResult = await user.getList({ login: check.login });
  
    let error = '';
  
    if (emailResult.length > 0) {
      error += 'This email is already in use. ';
    }
  
    if (loginResult.length > 0) {
      error += 'This login is already in use. ';
    }
  
    return { status: emailResult.length === 0 && loginResult.length === 0, error };
}

/*async function sendEmail(email, pass) {
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, 
        auth: {
            user: testAccount.user, 
            pass: testAccount.pass, 
        },
    });
    let info = await transporter.sendMail({
        from: '<atrubnikov@khpi.net>', 
        to: email, 
        subject: "Important! Password reminder.",
        text: "Your password is: <b>" + pass + "</b>",
        html: "Your password is: <b>" + pass + "</b>", 
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}*/

exports.addUser = async function (req, res){
    let valid = await validate(req.body);
    if(!valid.status) {
        console.log("IN IT here");
        res.send(render('signUp', `<div class='error-box'>Error!!! ${valid.error}</div>`));
    } else {
        console.log("IN IT");
        const user = new User();
        const hashedPass = await crypt.hash(req.body.password, 8);
        await user.save({
          full_name: req.body.fullname,
          login: req.body.login,
          password: hashedPass,
          email: req.body.email
        });
        const result = await user.getList({ login: req.body.login });
        req.session.user = result[0];
        res.redirect('/home');
    }
};

exports.login = async function(request, response) {
    if (request.method === 'GET') {
      if (!request.session.user) {
        response.send(render('signIn', false));
      } else {
        response.redirect('/home');
      }
    } else {
      const sess = request.session;
      if (!sess.user) {
        const user = new User();
        const result = await user.getList({ login: request.body.login });
        const isPasswordValid = result.length > 0 && await crypt.compare(request.body.password, result[0].password);
  
        if (isPasswordValid) {
          sess.user = result[0];
          response.redirect('/home');
        } else {
          response.send(render('signIn', '<div class="error-box">Wrong password or login!</div>'));
        }
      } else {
        response.redirect('/home');
      }
    }
};

exports.register = function(request, response) {
    response.send(render('signUp'));
};

exports.home = function(request, response) {
    console.log(request.session.user);
    if(!request.session.user) {
        response.redirect('/signIn');
    } else {
        response.send(render("home", `Your type of status: ${request.session.user.status}</br>`));
    }
};

exports.index = function(request, response) {
  const isUserAuthenticated = request.session.user;
  
  const pageToRender = isUserAuthenticated ? 'home' : 'index';
  response.send(render(pageToRender, false));
};

exports.done = function(request, response) {
    response.redirect("/done.html");
};

exports.logout = async function(request, response) {

    request.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        response.redirect('/signIn');
    });
};

/*exports.reminder = async function(request, response) {
    if (request.method === 'GET') {
      response.send(render('reminder'));
    } else {
      const user = new User();
      const result = await user.getList({ email: request.body.email });
      let message = "";
  
      if (result.length > 0) {
        const random = shortid.generate();
        const newPass = await crypt.hash(random, 8);
  
        await user.save({
          id: result[0].id,
          password: newPass
        });
  
        sendEmail(result[0].email, random);
        message = "<div class='success-box'>Your password was sent to your email</div>";
      } else {
        message = "<div class='error-box'>This e-mail doesn't exist as a user.</div>";
      }
  
      response.send(render('reminder', message ));
    }
};*/
  
