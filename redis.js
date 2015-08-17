
/**
 * Module Dependencies
 */

var redis = require('redis');
var config = require('./config.js');

/**
 * Redis Client
 */

var host = process.env.REDIS_PORT_6379_TCP_ADDR || process.env.REDIS_HOST || null;
var port = process.env.REDIS_PORT_6379_TCP_PORT || process.env.REDIS_PORT || null;
var auth = process.env.REDIS_AUTH || null;
var options = {};

if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  host = rtg.hostname;
  port = rtg.port;
  auth = rtg.auth.split(":")[1];
}

var redis = require('redis').createClient(port, host, options);

if (auth) {
  redis.auth(auth);
}

/**
 * Exports
 */

module.exports = redis;