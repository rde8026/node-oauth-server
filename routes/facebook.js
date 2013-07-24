/**
 * Created with IntelliJ IDEA.
 * User: ryaneldridge
 * Date: 12/18/12
 * Time: 3:58 PM
 * To change this template use File | Settings | File Templates.
 */

var passport = require('passport');

exports.facebookAuth = [
  passport.authenticate('facebook', { display: 'touch' }),
  function(req, res){

  }
]

exports.facebookCallback = [
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/user/user');
  }
]

exports.facebook = function(req, res) {
  res.render('facebook');
};

