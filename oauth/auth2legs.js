/**
 * Created with IntelliJ IDEA.
 * User: ryaneldridge
 * Date: 12/20/12
 * Time: 8:45 PM
 * To change this template use File | Settings | File Templates.
 */

var db = require('../db/sql');

exports.generateTempKey = function(req, res) {
  var json = JSON.parse(req.rawBody);
  db.createTempKey(json.username, /*json.password,*/ json.consumerKey, function(err, obj) {
    if (err) {
      res.json({error : "Unable to create temp key"});
    }
    res.json({key : obj.key});
  });
};

exports.generateToken = function(req, res) {
  //TODO: Addd username and password here or maybe make it session based...
  db.exchangeTempKey(req.params.key, function(err, token) {
    if (err) {
      res.writeHead(config.httpStatus.BAD_REQUEST, {'Content-Type' : 'text/plain'});
      res.send("Error creating token");
    }
    if (!token) {
      res.writeHead(config.httpStatus.BAD_REQUEST, {'Content-Type' : 'text/plain'});
      res.send("No Token returned");
    }
    res.json(token)
  });

};

