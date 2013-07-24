/**
 * Created with IntelliJ IDEA.
 * User: ryaneldridge
 * Date: 12/19/12
 * Time: 3:39 PM
 * To change this template use File | Settings | File Templates.
 */

var oauthorize = require('oauthorize')
  , passport = require('passport')
  , login = require('connect-ensure-login')
  , utils = require('../utils/utils')
  , sql = require('../db/sql');

/**
 * Create oauth server
 *
 */
var server = oauthorize.createServer();

/**
 * Server serialization of clients
 */
server.serializeClient(function(client, done) {
  return done(null, client.id);
});

/**
 * Server de-serialization of clients
 */
server.deserializeClient(function(id, done) {
  sql.oAuthFindClient(id, function(err, client){
    if (err) {
      return done(err);
    }
    return done(null, client);
  });
});

exports.requestToken = [
  passport.authenticate('consumer', { session: false }),
  server.requestToken(function(client, callbackURL, done) {
    var token = utils.uid(8)
      , secret = utils.uid(32);
    sql.oAuthSaveToken(token, secret, client.id, callbackURL, function(err){
      if (err) {
        return done(err);
      }
      return done(null, token, secret)
    });

  }),
  server.errorHandler()
]

exports.accessToken = [
  passport.authenticate('consumer', { session: false }),
  server.accessToken(
    function(requestToken, verifier, info, done) {
      if (verifier != info.verifier) {
        return done(null, false);
      }
      return done(null, true);
    },
    function(client, requestToken, info, done) {
      if (!info.approved) {
        return done(null, false);
      }
      if (client.id !== info.clientID) {
        return done(null, false);
      }

      var token = utils.uid(16)
        , secret = utils.uid(64)

      sql.oAuthSaveAccessToken(token, secret, info.userID, info.clientID, function(err){
        if (err) {
          return done(err);
        }
        return done(null, token, secret);
      });

    }
  ),
  server.errorHandler()
]


exports.userAuthorization = [
  login.ensureLoggedIn(),
  server.userAuthorization(function(requestToken, done) {

    sql.oAuthFindToken(requestToken, function(err, token){
      if (err) {
        return done(err);
      }
      sql.oAuthFindClient(token.clientId, function(err, client){
        if (err) {
          return done(err)
        }
        return done(null, client, token.callbackUrl)
      });
    });

  }),
  function(req, res){
    res.render('dialog', { transactionID: req.oauth.transactionID, user: req.user, client: req.oauth.client });
  }
]


exports.userDecision = [
  login.ensureLoggedIn(),
  server.userDecision(function(requestToken, user, res, done) {
    var verifier = utils.uid(8);

    sql.oAuthApprove(requestToken, user.id, verifier, function(err){
      if (err) {
        return done(err);
      }
      return done(null, verifier);
    });

  })
]