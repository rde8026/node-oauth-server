/**
 * Created with IntelliJ IDEA.
 * User: ryaneldridge
 * Date: 12/19/12
 * Time: 5:23 PM
 * To change this template use File | Settings | File Templates.
 */

var passport = require('passport')
  , login = require('connect-ensure-login');

exports.index = function(req, res) {
  res.send('OAuth Server');
};

exports.loginForm = function(req, res) {
  res.render('oauth-login');
};

exports.login = passport.authenticate('local', { successReturnToOrRedirect: '/', failureRedirect: '/login' });

exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
}

exports.account = [
  login.ensureLoggedIn(),
  function(req, res) {
    res.render('account', { user: req.user });
  }
]