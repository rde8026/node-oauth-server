
/*
 * GET users listing.
 */

var db = require("../db/sql.js")
  , config = require("../config/config")
  , passport = require('passport')
  , routeUtils = require('../routes/routeUtils');


exports.info = function(req, res) {
  res.render('user/user', {name: req.user.name});
};
exports.user1 = function(req, res) {
  res.render('user/user1', {name:req.user.name, id: req.user.id});
};

exports.login = [
  passport.authenticate('local', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/user/user');
  }
];

exports.landing = function(req, res) {
  res.render('login', { title: 'Meta Login', message : null});
};


/**
 * ################################
 */

exports.find = function(req, res) {
  /*var callback = {};

  callback.onSuccess = function(user) {
    res.send(user);
  };
  callback.onError = function(error) {
    res.writeHead(404, {'Content-Type':'text/plain'});
    res.send(parseErrorMessage(error.message));
  };*/
  var json = JSON.parse(req.rawBody);
  db.findUser(json.email, json.password, function(err, user) {
    if (err) {
      res.send(routeUtils.parseErrorMessage(error.message));
    }
    res.send(user);
  });
};

exports.list = function(req, res){
  var callback = {};

  callback.onSuccess = function(users) {
    res.send(users);
  };
  callback.onError = function(error) {
    res.writeHead(404, {'Content-Type':'text/plain'});
    res.send(parseErrorMessage(error.message));
  };
  db.findUsers(callback);

};

exports.create = function(req, res) {
  var callback = {};

  callback.onSuccess = function(user) {
    res.send(user);
  };
  callback.onError = function(error) {
    res.render('signup', {title : 'Sign Up', message : parseErrorMessage(error.message)});
  };

  var pwd = req.body.password;
  var pwdc = req.body.confirm;

  if (pwd != pwdc) {
    res.render('signup', {title: 'Sign Up', message : config.messages.mis_match_password});
  } else {
    db.createUser(req.body.name, req.body.email, req.body.city, pwd, callback);
  }

};

exports.signUp = function(req, res) {
  res.render('signup', {title: 'Sign Up', message : null});
};

