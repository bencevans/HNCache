
/**
 * Module Dependencies
 */

var redis = require('redis');
var config = require('./config.js');

/**
 * Redis Client
 */

var options = {};

if(typeof process.env.REDIS_AUTH !== "undefined") {
  options.auth_pass = rtg.auth.split(":")[1];
} else if (process.env.REDISTOGO_URL) {
  options.auth_pass = rtg.auth.split(":")[1];
}

if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis").createClient(rtg.port, rtg.hostname, options);
} else {
  var redis = require('redis').createClient(process.env.REDIS_PORT || null, process.env.REDIS_HOST || null, options);
}

/**
 * Exports
 */

module.exports = redis;