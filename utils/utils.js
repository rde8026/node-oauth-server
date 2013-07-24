/**
 * Created with IntelliJ IDEA.
 * User: ryaneldridge
 * Date: 12/19/12
 * Time: 3:51 PM
 * To change this template use File | Settings | File Templates.
 */
/**
 * Module dependencies.
 */
var crypto = require('crypto');

/**
 * Return a unique identifier with the given `len`.
 *
 *     utils.uid(10);
 *     // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */
exports.uid = function(len) {
  var buf = []
    , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    , charlen = chars.length;

  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }

  return buf.join('');
};

/**
 * Retrun a random int, used by `utils.uid()`
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


exports.encryptKey = function (key, secret) {
  //var algorithm = 'aes256';
  var  algorithm = 'aes-128-ecb';
  var cipher = crypto.createCipher(algorithm, secret);
  var encrypted = cipher.update(key, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;

};

exports.decryptKey = function(key, secret) {
  //var algorithm = 'aes256';
  var  algorithm = 'aes-128-ecb';
  var cipher = crypto.createDecipher(algorithm, secret);
  var decrypted = cipher.update(key, 'hex', 'utf8');
  decrypted += cipher.final('utf8');
  return decrypted;
};
