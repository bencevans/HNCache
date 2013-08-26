
/**
 * Module Dependencies
 */

var path = require('path');
var cheerio = require('cheerio');
var redis = require('../redis');
var config = require('../config');
var url = require('url');

/**
 * GET /:itemId
 */
module.exports = function(req, res, next) {

  redis.get(config.redis.prev + req.params.itemId, function(err, body) {
    redis.get(config.redis.prev + req.params.itemId + ':info', function(err, info) {

      try {
        info = JSON.parse(info);
      } catch (e) {
        return next(e);
      }

      if(!info || !info.url)
        return next();

      if(!body)
        return next();

      $ = cheerio.load(body);

      $('title').html($('title').html() + config.appendTitle);
      $('[href]').each(function() {
        if($(this).attr('src'))
          $(this).attr('href', url.resolve(info.url, $(this).attr('href')));
      });
      $('[src]').each(function(index, bob) {
        if($(this).attr('src'))
          $(this).attr('src', url.resolve(info.url, $(this).attr('src')));
      });

      if(req.query.textonly){
        $('[src]').each(function(index, bob) {
          $(this).remove();
        });
        $('script').each(function(index, bob) {
          $(this).remove();
        });
        $('link[href]').each(function(index, bob) {
          $(this).remove();
        });
      }

      $('body').html(config.cacheHeader + '<div style="position:relative;top:80px;">' + $('body').html() + '</div>');
      res.send($.html());

    });
  });
}