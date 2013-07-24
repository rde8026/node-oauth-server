/**
 * Created with IntelliJ IDEA.
 * User: ryaneldridge
 * Date: 12/17/12
 * Time: 9:29 PM
 * To change this template use File | Settings | File Templates.
 */

var passport = require('passport')
  , utils = require('./routeUtils')
  , db = require("../db/sql.js")
  , routeUtils = require('../routes/routeUtils')
  , mongoose = require('../db/mongoose-apps');



exports.loginUser = function(req, res) {
  var json = JSON.parse(req.rawBody);

  db.findUser(json.email, json.password, function(err, user) {
    if (err) {
      console.log(err);
      res.json(config.httpStatus.INTERNAL_ERROR, {code : config.errorCode.UNKNOWN, message : routeUtils.mapErrorMessage(err)});
    } else if (!user) {
      res.json(config.httpStatus.NOT_FOUND, {code : config.errorCode.NOT_FOUND, message : config.messages.no_user_found});
    } else {
      res.json(user);
    }

  });

};

exports.createUser = function(req, res) {
  var json = JSON.parse(req.rawBody);
  if (json.facebookId) {
    db.findOrCreateFacebookUserApi(json, function(err, user) {
      if (err) {
        console.log(err);
        res.json(config.httpStatus.INTERNAL_ERROR, {code : config.errorCode.UNKNOWN, message : routeUtils.mapErrorMessage(err)});
      } else if (!user) {
        res.json(config.httpStatus.BAD_REQUEST, { code : config.errorCode.NO_SAVE, message : config.messages.not_saved });
      } else {
        res.json(user);
      }
    });
  } else {
    db.findOrCreateInternalUserApi(json, function(err, user) {
      if (err) {
        res.json(config.httpStatus.INTERNAL_ERROR, {code : config.errorCode.UNKNOWN, message : routeUtils.mapErrorMessage(err)});
      } else if (!user) {
        res.json(config.httpStatus.BAD_REQUEST, { code : config.errorCode.NO_SAVE, message : config.messages.not_saved });
      } else {
        res.json(user);
      }
    });
  }


};

/**
 * ############### AUTHENTICATED REQUESTS #################
 */

exports.ping = [
  passport.authenticate('token', { session: false }),
  function(req, res) {
    res.send("true");
  }
];

exports.findUser = [
  passport.authenticate('token', { session: false }),
  function(req, res) {
    db.findUserById(req.user.id, function(err, user) {
      if (err) {
        console.log(err);
        res.json(config.httpStatus.INTERNAL_ERROR, {code : config.errorCode.UNKNOWN, message : err});
      } else if (!user) {
        res.json(config.httpStatus.BAD_REQUEST, { code : config.errorCode.NO_SAVE, message : config.messages.not_saved });
      } else {
        res.json(user);
      }
    });
  }
];

exports.createApp = [
  function(req, res) {
    var json = JSON.parse(req.rawBody);
    mongoose.createApp(json, function(err, post) {
      if (err) {
        console.log(err);
        res.send("Error: " + err);
      }
      res.json(post);
    });
  }
];

exports.findAppById = [
  function(req, res) {
    var id = req.params.id;
    mongoose.findAppById(id, function(err, app) {
      if (err) {
        res.send("Error: " + err);
      }
      res.json(app);
    });
  }
];

exports.findDinnerAppById = [
  function(req, res) {
    var id = req.params.id;
    mongoose.findDinnerByid(id, function(err, dinner) {
      if (err) {
        res.send("Error: " + err);
      }
      res.json(dinner);
    });
  }
];

exports.returnJunk = function(req, res) {
  res.json(createDummies());
};

function createDummies() {
  var total = 20;
  var array = [];
  for (var i = 0; i < total; i++) {
    array.push({name: "Ryan " + i, email : "rde8026" + i + "@gmail.com"});
  }
  return array;
}