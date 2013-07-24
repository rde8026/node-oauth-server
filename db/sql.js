/**
 * Created with IntelliJ IDEA.
 * User: ryaneldridge
 * Date: 12/17/12
 * Time: 11:07 PM
 * To change this template use File | Settings | File Templates.
 */

var Sequelize = require('sequelize')
  , bcrypt = require('bcrypt')
  , salt = bcrypt.genSaltSync(10)
  , crypto = require("crypto")
  , config = require('../config/config')
  , utils = require('../utils/utils')
  , md5 = require('MD5')

  , User, RequestToken, Client, AccessToken, TempKey;

require('date-utils');

var sequelize = new Sequelize(config.sql.db_name, config.sql.db_user, config.sql.db_password, {
  dialect: 'mysql',
  pool: { maxConnections: 5, maxIdleTime: 30}
});

exports.encodePassword = function(password) {
  return bcrypt.hashSync(password, salt);
};

exports.init = function(done) {

  User = sequelize.define('user', {
      id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true}
    , name: { type: Sequelize.STRING, allowNull: false }
    , email: { type: Sequelize.STRING, unique: true, allowNull: false }
    , city : { type: Sequelize.STRING }
    , password: { type: Sequelize.STRING, allowNull: true }
    , gender : { type : Sequelize.STRING, allowNull: true }
    , firstName : { type : Sequelize.STRING, allowNull: true }
    , lastName : { type : Sequelize.STRING, allowNull: true }
    , timezone : { type : Sequelize.STRING, allowNull: true}
    , birthday : { type : Sequelize.STRING, allowNull: true }
    , profileUrl : { type : Sequelize.STRING, allowNull : true }
    , facebookId : { type : Sequelize.STRING, allowNull: true}
  },
    {
      paranoid:true
      , underscored:true
    },
    {
      instanceMethods: {
        verifyPassword : function(pwd) {
          return bcrypt.compareSync(pwd, this.password);
        }
      }
    }
  );
  /**
   * OAuth Database Tables
   */
  RequestToken = sequelize.define('request_token', {
    token : { type: Sequelize.STRING }
    , secret : { type : Sequelize.STRING }
    , clientId : { type : Sequelize.INTEGER }
    , callbackUrl : { type : Sequelize.STRING }
    , verifier : { type : Sequelize.STRING }
    , approved : { type : Sequelize.BOOLEAN}
    , userId : { type : Sequelize.STRING }
  },
    {
      underscored:true
    }
  );

  AccessToken = sequelize.define('access_token', {
    token : { type: Sequelize.STRING }
    , secret : { type: Sequelize.STRING }
    , userId : { type: Sequelize.STRING}
    , clientId : { type: Sequelize.STRING}
    , expires : { type: Sequelize.DATE, allowNull: false }
  },
    {
      underscored:true
    }
  );

  Client = sequelize.define('client', {
      client_id : { type : Sequelize.INTEGER, autoIncrement: true, primaryKey: true }
    , id : { type : Sequelize.INTEGER }
    , name : { type: Sequelize.STRING }
    , consumerKey : { type : Sequelize.STRING }
    , consumerSecret : { type : Sequelize.STRING }
  },
    {
      paranoid:true,
      underscored:true
    }
  );

  TempKey = sequelize.define('temp_key', {
    id : { type : Sequelize.INTEGER, autoIncrement: true, primaryKey: true }
    , user_id : { type : Sequelize.INTEGER, allowNull: false }
    , client_id : { type : Sequelize.INTEGER, allowNull: false }
    , key : {type: Sequelize.STRING, allowNull: false, unique: true}
  },
    {
      paranoid:true,
      underscored:true
    }
  );

  /**
   * End OAuth Database tables
   */

  if (config.sql.drop_load) {
    sequelize.drop().success(function() {
      if (config.log.debug) {
        console.log("Dropped all tables");
      }

      sequelize.sync().success(function() {
        if (config.log.debug) {
          console.log("Synced db.");
        }
        if (config.oauth.debug) {
          var secret = utils.uid(16);
          Client.build({
            id : 1
            , name : "RyanClient"
            , consumerKey: "abc123"
            , consumerSecret: "ssh-secret"
            //, consumerSecret: secret
          })
            .save()
            .success(function(){
              console.log("Created dummy client");
              User.build({
                name : "dummy_bob"
                , email : "bob"
                , password : bcrypt.hashSync("secret", salt)
              })
                .save()
                .success(function(){
                  console.log("Created dummy user");
                  done(true);
                })
                .error(function(err){
                  console.log("Error creating user");
                  console.log(err);
                });
            })
            .error(function(err){
              console.log(err)
            });

        }
      }).error(function(error) {
          if (config.log.warn) {
            console.log("Sync error " + error);
          }
      });

    }).error(function(error){
        if (config.log.warn) {
          console.log("Drop error " + error);
        }
      });
  } else {
    sequelize.sync().success(function() {
      if (config.log.debug) {
        console.log("Synced db.");
        done(true);
      }
    }).error(function(error) {
        if (config.log.warn) {
          console.log("Sync error " + error);
        }
    });
  }

};


/**
 * ################## USER DB OPERATIONS ###################
 */

exports.createUser = function(name, email, city, password, callback) {
  User.build({
      name : name
    , email : email
    , city : city
    , password : bcrypt.hashSync(password, salt)
  }).save()
    .success(function(user) {
      callback.onSuccess(user);
    })
    .error(function(error){
      callback.onError(error);
    });
};

exports.findOrCreateFacebookUser = function(profile, callback) {
  User.find({
    where: {facebookId:profile._json.id}
  })
    .success(function(user){
      if (user) {
        callback.onSuccess(user);
      } else {
        User.build({
          name : profile.displayName
          , email : profile._json.email
          , birthday: profile._json.birthday
          , gender : profile._json.gender
          , lastName: profile._json.last_name
          , firstName: profile._json.first_name
          , profileUrl: profile._json.link
          , timezone: profile._json.timezone
          , facebookId: profile._json.id
        }).save()
          .success(function(user){
            callback.onSuccess(user);
          })
          .error(function(error){
            callback.onError(error);
          });
      }
    })
    .error(function(error){
      callback.onError(error);
    });
};

exports.findOrCreateFacebookUserApi = function(json, callback) {
  User.find({
    where : { facebookId : json.facebookId }
  })
    .success(function(user) {
      if (user) {
        callback(null, user);
      } else {
        User.build({
          name : json.name
          , email : json.email
          , birthday : json.birthday
          , gender : json.gender
          , lastName : json.lastName
          , firstName : json.firstName
          , facebookId : json.facebookId
          , profileUrl: json.profileUrl
        })
        .save()
        .success(function(user) {
          callback(null, user);
        })
        .error(function(err) {
          callback(err);
        });
      }
    })
    .error(function(err) {
      callback(err);
    });
};

exports.findOrCreateInternalUserApi = function(json, callback) {
  User.find({
    where : { id : json.id }
  })
    .success(function(user) {
      if (user) {
        callback(null, user);
      } else {
        User.build({
          name : json.name
          , email : json.email
          , password : bcrypt.hashSync(json.password, salt)
        })
          .save()
          .success(function(user) {
            callback(null, user);
          })
          .error(function(err) {
            callback(err);
          });
      }
    })
    .error(function(err) {
      callback(err);
    });
};

exports.findUsers = function(callback) {
  User.findAll()
    .success(function(users) {
      callback.onSuccess(users);
    })
    .error(function(error) {
      callback.onError(error);
    });
};

exports.findUser = function(email, password, callback) {
  var pwd = bcrypt.hashSync(password, salt);
  User.find({
    where : {email:email, password: pwd}
  })
    .success(function(user) {
      callback(null, user);
    })
    .error(function(error){
      callback(error, null);
    });
};

exports.findUserById = function(id, callback) {
  User.find({
    where : {id:id}
  })
    .success(function(user) {
      if (!user) {
        callback(config.messages.no_user_found, null);
      }
      callback(null, user);
    })
    .error(function(error){
      callback(error, null);
    });
};

/**
 * ################## END USER DB OPERATIONS ###################
 */

/**
 * ################## TEMP KEY DB OPERATIONS ###################
 */

exports.createTempKey = function(username, /*password,*/ consumerKey, callback) {
  findUserByUsernameAndPassword(username, /*password,*/ function(err, user) {
    if (err) {
      callback(err, null)
    }
    findClientByConsumerKey(consumerKey, function(err, client) {
      if (err) {
        callback(err, null);
      }
      var key = utils.uid(25);
       TempKey.build({
         user_id : user.id,
         client_id : client.client_id,
         key : key
       })
       .save()
       .success(function(key) {
         var kk = utils.encryptKey(key.key, client.consumerSecret);
         var obj = {
            user : user,
            key : kk
         };
          callback(null, obj);
       })
       .error(function(err) {
          callback(err, null);
       });

    });
  });


};

exports.exchangeTempKey = function(key, callback) {
  TempKey.find({
    where : {key:key}
  })
    .success(function(tempKey) {
      if (!tempKey) {
        callback(null, null);
      }
      var token = utils.uid(16)
        , secret = utils.uid(64)
        , expire = new Date();
      AccessToken.build({
        token:token
        , secret: secret
        , userId: tempKey.user_id
        , clientId: tempKey.client_id
        , expires: expire.addHours(10)
      })
        .save()
        .success(function(token) {
          if (!token) {
            callback(null, null);
          }
          var obj = {
            token : token.token,
            secret : token.secret
          };
          callback(null, obj);
          removeTempKey(key);
        })
        .error(function(err) {
          callback(err, null);
        });
    })
    .error(function(err) {
      callback(err, null);
    });
};

function findUserByUsernameAndPassword(username, /*password,*/ callback) {
  //var pwd = bcrypt.hashSync(password, salt);
  //where : {email:username, password:pwd}
  User.find({
    where : {email:username}
  })
    .success(function(user) {
      callback(null, user);
    })
    .error(function(err) {
      callback(err, null);
    });
}

function findClientByConsumerKey(consumerKey, callback) {
  Client.find({
    where : {consumerKey: consumerKey}
  })
    .success(function(client) {
      callback(null, client);
    })
    .error(function(err) {
      callback(err, null);
    });
}

function removeTempKey(key) {
  TempKey.find({
    where : {key:key}
  })
    .success(function(tempKey) {
      tempKey.destroy()
        .success(function() {
          if (config.log.debug) {
            console.log("Removed temp key: " + key);
          }
        })
        .error(function(err) {
          console.log(err);
        });
    })
    .error(function(err) {
      console.log(err);
    });
}

/**
 * ################## END TEMP KEY DB OPERATIONS ###################
 */

/**
 ######################################## OAUTH REQUIRED DATABASE FUNCTIONS ##########################################
 */


/**
 * Saves a request token
 * @param token
 * @param secret
 * @param clientId
 * @param callbackUrl
 * @param done
 */
exports.oAuthSaveToken = function(token, secret, clientId, callbackUrl, done) {
  RequestToken.build({
    token : token
    , secret : secret
    , clientId : clientId
    , callbackUrl : callbackUrl
  })
    .save()
    .success(function(token) {
      done(null);
    })
    .error(function(err){
      if(config.log.warn) {
        console.log(err)
      }
      done(err);
    });
};

/**
 * Find RequestToken by key (which is the token value)
 * @param key
 * @param done
 */
exports.oAuthFindToken = function(key, done) {
  RequestToken.find({
    where : {token:key}
  })
    .success(function(token) {
       done(null, token);
    })
    .error(function(err){
      done(err);
    });
};

/**
 * Approve a  token
 * @param key
 * @param userID
 * @param verifier
 * @param done
 */
exports.oAuthApprove = function(key, userID, verifier, done) {
  RequestToken.find({
    where : {token:key}
  })
    .success(function(token) {
      token.verifier = verifier;
      token.userId = userID;
      token.approved = true;
      token.save()
        .success(function(token){
          if (config.log.debug) {
            console.log("Found and updated Token " + key);
          }
          done(null);
        })
        .error(function(err) {
          console.log(err);
          done(err);
        });
    })
    .error(function(err){
      done(err);
    });
};

/**
 * Find Client by ID
 * @param id
 * @param done
 */
exports.oAuthFindClient = function(id, done) {
  Client.find({
    where : {id : id}
  })
    .success(function(client){
      done(null, client);
    })
    .error(function(err){
      done(err, null);
    });
};

/**
 * Find Client by Consumer Key
 * @param consumerKey
 * @param done
 */
exports.oAuthFindClientByConsumerKey = function(consumerKey, done) {
  Client.find({
    where : {consumerKey: consumerKey}
  })
    .success(function(client){
      done(null, client);
    })
    .error(function(err){
      done(err);
    });
};

/**
 * Save access token
 * @param token
 * @param secret
 * @param userId
 * @param clientId
 * @param done
 */
exports.oAuthSaveAccessToken = function(token, secret, userId, clientId, done) {
  var expire = new Date();
  AccessToken.build({
    token:token
    , secret: secret
    , userId: userId
    , clientId: clientId
    , expires: expire.addHours(10)
  })
    .save()
    .success(function(accessToken){
      done(null);
    })
    .error(function(err){
      done(err);
    });
};

/**
 * Find access token by key
 * @param key
 * @param done
 */
exports.oAuthFindAccessToken = function(key, done) {
  AccessToken.find({
    where : {token : key}
  })
    .success(function(accessToken) {
      if (accessToken) {
        var now = new Date();
        if (now.isAfter(accessToken.expires)) {
          if (config.log.debug) {
            console.log("Access token expired");
          }
          return done("expired token");
        } else {
          done(null, accessToken);
          addTimeToAccessToken(key);
        }
      } else {
        done("No Token")
      }
    })
    .error(function(err){
      done(err)
    });
};

function addTimeToAccessToken(key) {
  //TODO: Check if token is set to expire within a reasonable timeframe and then add to it.
  AccessToken.find({
    where : {token: key}
  })
    .success(function(token) {
      token.expires = token.expires.addHours(1);
      token.save()
        .success(function() {
          if (config.log.debug) {
            console.log("Updated token expiration!");
          }
        });
    });
  //for now just drop errors on the floor.
}

/**
 * Find user by email
 * @param email
 * @param done
 */
exports.oAuthFindUserByEmail = function(email, done) {
  User.find({
    where : {email:email}
  })
    .success(function(user) {
      return done(null, user);
    })
    .error(function(err) {
      return done(null, null);
    });
};

/**
 * Find User by ID
 * @param id
 * @param done
 */
exports.oAuthFindUserById = function(id, done) {
  User.find({
    where : {id: id}
  })
    .success(function(user){
      return done(null, user);
    })
    .error(function(err){
      return done(null, null);
    });
};