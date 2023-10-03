const User = require('./models/user');
const fs = require('fs');
const crypt = require('bcryptjs');
const nodemailer = require("nodemailer");
const shortid = require("shortid");

function render(file, insert = false) {
    try {
        let eror = fs.readFileSync(__dirname + `/views/${file}.html`, 'utf-8');
        if (insert !== false) {
          Object.entries(insert).map(obj => {
            const [key, value] = obj;
            if(key === 'avatar') {
              eror = eror.replace(`#${key}1#`, value ? `<img src="${value}" class="avatarValue ${value}">` : '');
              eror = eror.replace(`#${key}2#`, value ? `<img src="${value}">` : '');
            }
            else if(value.toString() != '') eror = eror.replace(`#${key}#`, value ? `<span title="${value}" class="${key}Text">${value}</span>` : '');
          });
        }
        return eror;
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

async function sendEmail(email, pass) {
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
}

exports.addUser = async function (req, res){
    let valid = await validate(req.body);
    if(!valid.status) {
        res.send(render('signUp', `Error!!! ${valid.error}`));  fix
    } else {
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
          response.send(render('signIn', {error: 'Wrong password or login!'}));
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
    if(!request.session.user) {
        response.redirect('/signIn');
    } else {
      response.send(render("home", {
        login: request.session.user.login, 
        fullname: request.session.user.full_name, 
        email: request.session.user.email,
        avatar: request.session.user.avatar}));
    }
};

exports.index = function(request, response) {
  const isUserAuthenticated = request.session.user;
  
  const pageToRender = isUserAuthenticated ? 'home' : 'index';
  response.send(render(pageToRender, false));
};

exports.logout = async function(request, response) {

    request.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        response.redirect('/signIn');
    });
};

exports.reminder = async function(request, response) {
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
        message = "Your password was sent to your email";
      } else {
        message = "This e-mail doesn't exist as a user.";
      }
  
      response.send(render('reminder', {message: message} ));
    }
};
  
exports.settings = async function(request, response) {
  if(!request.session.user) {
    response.redirect('/signIn');
  }
  else {
    if (request.method === 'GET') {
      response.send(render('settings', {
        login: request.session.user.login, 
        fullname: request.session.user.full_name, 
        email: request.session.user.email, 
        avatar: request.session.user.avatar}));
    }
    else {
      const user = new User();
      const isPasswordValid = await crypt.compare(request.body.passwordCheck, request.session.user.password);
      console.log(isPasswordValid);
      if (!isPasswordValid) {
        response.send(render('settings', {
          login: request.session.user.login, 
          fullname: request.session.user.full_name, 
          email: request.session.user.email, 
          avatar: request.session.user.avatar,
          error: 'Your password is wrong!'
        }))
      }
      else {
        if(request.body.email) {
          let result = await user.getList({ email: request.body.email });
          if(result[0] && request.body.email !== request.session.user.email) {
            response.send(render('settings', {
              login: request.session.user.login, 
              fullname: request.session.user.full_name, 
              email: request.session.user.email, 
              avatar: request.session.user.avatar,
              error: 'This e-mail is already in use.'
            }))
            return;
          }
          if(request.body.email !== request.session.user.email) {
            await user.save({
              id: request.session.user.id ,
              email: request.body.email
            });
          }
        }
        if(request.body.fullname) {
          if(request.body.fullname !== request.session.user.full_name)
          await user.save({
            id: request.session.user.id ,
            full_name: request.body.fullname
          });
        }
        if(request.body.avatar) {
          if(request.body.avatar !== request.session.user.avatar)
          await user.save({
            id: request.session.user.id ,
            avatar: request.body.avatar
          });
        }
        if(request.body.password) {
          const hashedPass = await crypt.hash(request.body.password, 8);
          await user.save({
            id: request.session.user.id,
            password: hashedPass
          });
        }
        let status;
        if(request.session.user.full_name != request.body.fullname 
          || request.session.user.email != request.body.email
            || (request.body.password != request.body.passwordCheck && request.body.password
              || request.session.user.avatar != request.body.avatar)) {
                status = 'Settings have changed.';
        }
        else status = '';
        const curruser = await user.getList({ login: request.session.user.login });
        request.session.user = curruser[0];
        response.send(render('settings', {
          status: status, 
          login: request.session.user.login, 
          fullname: request.session.user.full_name, 
          email: request.session.user.email,
          avatar: request.session.user.avatar}));
      }
    }
  } 
}

exports.stats = async function(request, response) {
  if(!request.session.user) {
    response.redirect('/signIn');
  }
  else {
    if (request.method === 'GET') {
      response.send(render('stats', {
        login: request.session.user.login, 
        fullname: request.session.user.full_name, 
        email: request.session.user.email, 
        wins: request.session.user.counter_wins.toString(), 
        loss: request.session.user.counter_losses.toString(),
        avatar: request.session.user.avatar}));
    }
  }
}

exports.chatPage = async function(req, res) {
  if(!req.session.user) {
    res.redirect('/signIn');
  }
  else res.sendFile(__dirname + '/views/chat.html')
}

exports.delete = async function(request, res) {
  if(!request.session.user) {
    res.redirect('/signIn');
  }
  else {
    const user = new User();
    console.log(request.session.user.id);
    await user.deleteUser(request.session.user.id);
    res.redirect('/logout');
  }
}

exports.win = async function(request, response) {
  if(!request.session.user) {
    response.redirect('/signIn');
  }
  else{  
    const user = new User();
    await user.save({
      id: request.session.user.id,
      counter_wins: request.session.user.counter_wins++
    });
    response.redirect('/home');
  }
}

exports.lose = async function(request, response) {
  if(!request.session.user) {
    response.redirect('/signIn');
  }
  else{ 
    const user = new User();
    await user.save({
      id: request.session.user.id,
      counter_losses: request.session.user.counter_losses++
    });
    response.redirect('/home');
  }
}