
/**
 * Module Dependencies
 */

var http = require('http');
var path = require('path');
var express = require('express');
var app = express();
var cheerio = require('cheerio');
var fs = require('fs');
var url = require('url');
var hn = require('hn.js');
var request = require('request');
var _ = require('underscore');
var config = require(__dirname + '/config.js');
var redis = require('./redis');

/**
 * Worker Kickstart
 */

redis.on('connect', function() {
  startWorker();
});

// Web (Express) Setup
app.configure(function(){
  app.enable('trust proxy');
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.engine('html', require('hbs').__express);
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express['static'](path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


// Rendered Static Pages Route.
app.get("/", function (req, res, next) {
  res.sendfile(path.resolve(__dirname, './public/index.html'));
});


app.get('/:itemId', function(req, res, next) {

  redis.get(config.redis.prev + req.params.itemId, function(err, body) {
    redis.get(config.redis.prev + req.params.itemId + ':info', function(err, info) {

      try {
        info = JSON.parse(info);
      } catch (e) {
        return next(e);
      }

      if(!info || !info.url)
        return res.send(404);

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
});

var server = http.createServer(app).listen(app.get('port'), function() {
  console.log('HNCache is listening on port ', app.get('port'));
});

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

function startWorker() {
  updateItems();
  setInterval(function() {
    updateItems();
  }, 1000 * 60 * 10);
}
