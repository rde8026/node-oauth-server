/**
 * Created with IntelliJ IDEA.
 * User: ryaneldridge
 * Date: 12/20/12
 * Time: 6:26 PM
 * To change this template use File | Settings | File Templates.
 */


var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy
  , config = require("../config/config")
  , sql = require('../db/sql');


passport.use(new FacebookStrategy({
    clientID: config.facebook.appId,
    clientSecret: config.facebook.appSecret,
    callbackURL: config.facebook.callbackUrl
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      if (config.log.debug) {
        console.log(profile);
      }
      var callback = {};
      callback.onSuccess = function(user) {
        return done(null, user);
      };
      callback.onError = function(error) {
        return done(error, null);
      };
      sql.findOrCreateFacebookUser(profile, callback);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
