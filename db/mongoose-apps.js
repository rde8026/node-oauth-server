/**
 * Created with IntelliJ IDEA.
 * User: ryaneldridge
 * Date: 12/23/12
 * Time: 12:01 AM
 * To change this template use File | Settings | File Templates.
 */


var mongoose = require('mongoose')
  , config = require('../config/config')
  , AWS = require('aws-sdk')
  , db
  , appSchema, App
  , dinnerSchema, Dinner
  , generalSchema, General
  , s3;

exports.init = function(done) {
  //TODO: Figure this out.
  //AWS.config.loadFromPath('../config/aws.json');
  AWS.config.update({accessKeyId : config.aws.accessKey, secretAccessKey : config.aws.accessSecret, region : config.aws.region});
  s3 = new AWS.S3();

  mongoose.connect(config.mongo.appUrl);
  db = mongoose.connection;
  db.on('error', function(err) {
    console.log(err);
    done(false);
  });
  db.once('open', function callback() {
    if (config.log.info) {
      console.log('Connected to MongoDB');
    }

    appSchema = mongoose.Schema({
      name : String
      , user_id : Number
      , s3Bucket : String
      , invites : [ { id : Number, name : String,  email : String } ]
      , accepts : [ { id : Number, name : String, email : String } ]
      , eventType : String
      , eventTypeId : String
      , photos : [ { name : String, url : String } ]
      , videos : [ { name : String, url : String } ]
    });

    dinnerSchema = mongoose.Schema({
      restaurant : { name : String, latitude : String, longitude : String, city : String, yelpUrl : String }
      , seats : Number
      , isFull : Boolean
      , confirmationCount : Number
      , confirmations : [ {personId : Number, personName : String, confirmedTime : Date} ]
      , reservation : Date
      , twitterHandle : String
    });

    generalSchema = mongoose.Schema({
      twitterHashTag : String
      , confirmationCount : Number
      , confirmations : [ {personId : Number, personName : String, confirmedTime : Date} ]
      , startDate : Date
      , endDate : Date
    });

    App = mongoose.model('App', appSchema);
    Dinner = mongoose.model('Dinner', dinnerSchema);
    General = mongoose.model('General', generalSchema);

    done(true);
  });
};

/*
  Internal Methods
 */
function getBucketName(appName) {
  return "";
}

function createDinnerApp(app, callback) {
  var dinner = new Dinner({
    restaurant : { name : app.restaurant.name, latitude : app.restaurant.latitude, longitude : app.restaurant.longitude, city : app.restaurant.city, yelpUrl : app.restaurant.yelpUrl }
    , seats : app.seats
    , reservation : app.reservation//Date.now()
    , twitterHandle : app.twitterHandle
  });
  dinner.save(function(err) {
    if (err) {
      callback(err);
    }
    callback(null, dinner);
  });
}

function createWrapperApp(app, typeId, callback) {
  var newApp = new App({
    name : app.name
    , eventType : app.type
    , eventTypeId : typeId
  });

  newApp.save(function(err) {
    if (err) {
      console.log(err);
      callback(err, null);
    }
    callback(null, newApp);
  });
}

exports.createApp = function(app, callback) {
  var typeId;
  if (app.type === 'Dinner' || app.type === 'DINNER') {
    createDinnerApp(app, function(err, dinner) {
      if (err) {
        callback(err, null);
      }
      typeId = dinner._id;
      createWrapperApp(app, typeId, callback);
    });
  } else {

  }
};

exports.findAppById = function(id, callback) {
  var App = mongoose.model('App');
  App.findOne({_id : id}, function(err, app) {
    if (err) {
      callback(err);
    }
    callback(null, app);
  });
};

exports.findDinnerByid = function(id, callback) {
  var Dinner = mongoose.model('Dinner');
  Dinner.findOne({_id : id}, function(err, dinner) {
    if (err) {
      callback(err);
    }
    callback(null, dinner);
  });
}
