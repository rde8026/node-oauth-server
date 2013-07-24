/**
 * Created with IntelliJ IDEA.
 * User: ryaneldridge
 * Date: 12/20/12
 * Time: 8:29 PM
 * To change this template use File | Settings | File Templates.
 */

var config = require('../config/config');

exports.verifyAuthentication = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};

exports.parseErrorMessage = function(msg) {
  var output = "";
  try {
    output = msg.substring(msg.indexOf(":") + 1, msg.length);
  } catch (err) {
    console.log(err);
    output = msg;
  }
  return output;
};

exports.mapErrorMessage = function(err) {
  var message = "Unknown Error";
  if (err) {
    message = getHumanMessage(err.code);
  }
  return message;
};

function getHumanMessage(code) {
  if (code == 'ECONNREFUSED') {
    return config.messages.backend_issues;
  }
}