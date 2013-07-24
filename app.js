
/**
 * Module dependencies.
 */

var express = require('express')
  , fs = require('fs')
  , crypto = require("crypto")
  , http = require('http')
  , https = require('https')
  , path = require('path')
  , passport = require('passport')
  , util = require('util')
  , database = require("./db/sql")
  , mongoDb = require('./db/mongoose-apps')
  , config = require("./config/config")
  , oauth = require('./oauth/auth')
  , oauth2Leg = require('./oauth/auth2legs')

  , routeUtils = require('./routes/routeUtils')
  , facebook = require('./routes/facebook')
  , api_v1 = require('./routes/api-v1')
  , site = require('./routes/site')
  , user = require('./routes/user');

var app = express();

app.configure(function(){
  app.set('port', config.server.port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger());
  app.use(function(req, res, next) {
    var data = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
      data += chunk;
    });
    req.on('end', function() {
      req.rawBody = data;
    });
    next();
  });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  /*
    Required for oAuth Stuff
   */
  app.use(express.cookieParser());
  //TODO: Back session with redis
  app.use(express.session({ secret: config.server.sessionSecret , cookie: { maxAge : config.server.maxAge } }));
  app.use(passport.initialize());
  app.use(passport.session());
  /*
    End oAuth Requirements
   */
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

/**
 * Passport Strategies
 */
require('./oauth/strategy');
require('./oauth/facebook-strategy');

/**
 * OAuth Routes
 */
app.get('/login', site.loginForm);
app.post('/login', site.login);

app.get('/dialog/authorize', oauth.userAuthorization);
app.post('/dialog/authorize/decision', oauth.userDecision);

app.post('/oauth/request_token', oauth.requestToken);
app.post('/oauth/access_token', oauth.accessToken);

/**
 * Auth 2 legged
 */
app.post('/create/key', oauth2Leg.generateTempKey);
app.get('/generate/token/:key', oauth2Leg.generateToken);

/*
 * User sign up routes
 */
app.get('/', user.landing);
app.post('/user/login', user.login);
app.get('/user/signup', user.signUp);
app.post('/user/create', user.create);

/**
 * Facebook Sign in Routes
 */
app.get('/auth/facebook', facebook.facebookAuth);
app.get('/auth/facebook/callback', facebook.facebookCallback);
app.get('/facebook/logout', facebook.logout);

/**
 * API Shit
 */
app.get('/api/v1/ping', api_v1.ping);
app.post('/api/v1/login', api_v1.loginUser);
app.post('/api/v1/user', api_v1.createUser);
app.get('/api/v1/user', api_v1.findUser);

app.post('/api/v1/app', api_v1.createApp);
app.get('/api/v1/app/:id', api_v1.findAppById);
app.get('/api/v1/app/dinner/:id', api_v1.findDinnerAppById);

app.get('/api/v1/junk', api_v1.returnJunk);

/**
 * Web App shit
 */
app.get('/user/user', routeUtils.verifyAuthentication, user.info);
app.get('/user/user1', routeUtils.verifyAuthentication, user.user1);
app.get('/logout', routeUtils.logout);

/**
 * Init the database - see config.js
 */
database.init(function(bool) {
  if (bool) {

    mongoDb.init(function(bool) {
      if (bool) {

        if (config.server.http) {
          http.createServer(app).listen(app.get('port'), function(){
            console.log("Express server listening on port " + app.get('port'));
          });
        } else {

          var options = {
            key: fs.readFileSync("./certificate/server.key"),
            cert: fs.readFileSync("./certificate/cert.pem")
          };

          https.createServer(options, app).listen(app.get('port'), function(){
            console.log("Express server listening on port " + app.get('port'));
          });
        }

      } else {
        console.log("Unable to connect to mongo, not starting server");
      }
    });

  } else {
    console.log("Unable to connect to db, not starting server");
  }
});



/*if (config.server.http) {
  http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });
} else {

  var options = {
    key: fs.readFileSync("./certificate/server.key"),
    cert: fs.readFileSync("./certificate/cert.pem")
  };

  https.createServer(options, app).listen(app.get('port'), function(){
   console.log("Express server listening on port " + app.get('port'));
  });
}*/

