/**
 * Created with IntelliJ IDEA.
 * User: ryaneldridge
 * Date: 12/18/12
 * Time: 3:38 PM
 * To change this template use File | Settings | File Templates.
 */

config = {};


config.log = {
  debug : true
  , info : true
  , warn : true
};

config.server = {
  http : true,
  port : 8085,
  sessionSecret : 'keyboard cat',
  maxAge : 60000 * 10
};

config.oauth = {
  debug : true
};

config.sql = {
  drop_load : true
  , db_name : "meta_api"
  , db_user : "meta_api_user"
  , db_password : "meta"
  //m3ta#!pi
  //Hash : *EBC3E08485AF6AF6F8B117B24740D882F39A748C
};

config.mongo = {
  appUrl : 'mongodb://localhost/apps'
};

config.aws = {
  accessKey : ''
  , accessSecret : ''
  , region : 'us-east-1'
};

config.facebook = {
  appId : ""
  , appSecret : ""
  , callbackUrl : ""
};

config.messages = {
  no_user_found : "Sorry, we could not find a user with those credentials.\n Why not sing up!\n"
  , mis_match_password : 'Sorry your passwords do not match!'
  , not_saved : "Sorry, we were unable to save your request."
  , backend_issues : "Sorry, we are having trouble with our backend.\nPlease try again in a couple of minutes."
};

config.httpStatus = {
  OK : 200,
  BAD_REQUEST : 400,
  UNAUTHORIZED : 401,
  FORBIDDEN : 403,
  NOT_FOUND : 404,
  INTERNAL_ERROR : 500
};

config.httpHeaders = {
  CONTENT_TYPE : "Content-Type",
  CONTENT_LENGTH : "Content-Length"
};

config.httpTypes = {
  TEXT_PLAIN : "text/plain",
  APP_JSON : "application/json",
  APP_XML : "application/xml"
};

config.errorCode = {
  NOT_FOUND : 1000
  , NO_SAVE : 1001
  , UNKNOWN : 0001
};

module.exports = config;