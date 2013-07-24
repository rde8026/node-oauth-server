/**
 * Created with IntelliJ IDEA.
 * User: ryaneldridge
 * Date: 12/19/12
 * Time: 4:58 PM
 * To change this template use File | Settings | File Templates.
 */


var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , ConsumerStrategy = require('passport-http-oauth').ConsumerStrategy
  , TokenStrategy = require('passport-http-oauth').TokenStrategy
  , sql = require('../db/sql')
  , bcrypt = require('bcrypt');

  require('date-utils');

passport.use(new LocalStrategy(
  function(username, password, done) {
    sql.oAuthFindUserByEmail(username, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }
      if (user.password != sql.encodePassword(password)) {
        return done(null, false);
      }
      return done(null, user);
    });

  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  sql.oAuthFindUserById(id, function(err, user){
    done(err, user);
  });
});


passport.use('consumer', new ConsumerStrategy(

  function(consumerKey, done) {

    sql.oAuthFindClientByConsumerKey(consumerKey, function(err, client){
      if (err) {
        return done(err);
      }
      if (!client) {
        return done(null, false)
      }
      return done(null, client, client.consumerSecret);
    });
  },

  function(requestToken, done) {

    sql.oAuthFindToken(requestToken, function(err, token){
      if (err) {
        return done(err);
      }
      var info = {
        verifier : token.verifier,
        clientID: token.clientId,
        userID : token.userId,
        approved : token.approved
      };
      done(null, token.secret, info);
    });
  },

  function(timestamp, nonce, done) {
    done(null, true)
  }
));


passport.use('token', new TokenStrategy(

  function(consumerKey, done) {

    sql.oAuthFindClientByConsumerKey(consumerKey, function(err, client) {
      if (err) {
        return done(err);
      }
      if (!client) {
        return done(null, false);
      }
      return done(null, client, client.consumerSecret);
    });
  },

  function(accessToken, done) {

    sql.oAuthFindAccessToken(accessToken, function(err, token) {
      if (err) {
        return done(null);
      }

      sql.oAuthFindUserById(token.userId, function(err, user){
        if (!user) {
          return done(null, false);
        }
        var info = {scope:'*'}
        done(null, user, token.secret, info);
      });
    });

  },

  function(timestamp, nonce, done) {
    done(null, true)
  }
));