
/**
 * Module Dependencies
 */

var hn = require('hn.js');
var _ = require('underscore');
var redis = require('./redis');
var config = require('./config');
var request = require('request');

/**
 * update HN New Item Caches
 */
function updateItems() {
  hn.newest(function(err, items) {
    _.each(items, function(item) {
      redis.del(config.redis.prev + item.id);
      redis.del(config.redis.prev + item.id + ':info');
      redis.exists(config.redis.prev + item.id, function(err, exists) {

        if(err)
          return console.error(err);

        if(!exists)
          request(item.url, function(err, res, body) {
            console.log(item);
            redis.set(config.redis.prev + item.id.toString(), body, function (err) {
              if(err)
                return console.error(err);
              console.log(item.id + ' : ' + item.title + ' : Cached');
            });
            redis.set(config.redis.prev + item.id.toString() + ':info', JSON.stringify(item), function (err) {
              if(err) console.error(err);
            });
          });
      });
    });
  });
}

/**
 * Exports
 */

module.exports.updateItems = updateItems;

function startWorker() {
  updateItems();
  setInterval(function() {
    updateItems();
  }, 1000 * 60 * 10);
}

/**
 * Worker Kickstart
 */

if(!module.parent) {
  redis.on('connect', function() {
    startWorker();
  });
}
