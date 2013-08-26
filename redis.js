
/**
 * Module Dependencies
 */

var redis = require('redis');
var config = require('./config.js');

/**
 * Redis Client
 */

var host = process.env.REDIS_HOST || null;
var port = process.env.REDIS_PORT || null;
var options = {};

if(typeof process.env.REDIS_AUTH !== "undefined") {
  options.auth_pass = process.env.REDIS_AUTH;
} else if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  host = rtg.hostname;
  port = rtg.port;
  options.auth_pass = rtg.auth.split(":")[1];
}

var redis = require('redis').createClient(port, host, options);

/**
 * Exports
 */

module.exports = redis;