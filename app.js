
// Require Stuff
var http = require('http'),
path = require('path'),
express = require('express'),
app = express(),
cheerio = require('cheerio'),
fs = require('fs'),
url = require('url'),
hn = require('hn.js'),
request = require('request'),
_ = require('underscore');

// Setup Config
var config = require(__dirname + '/config.js');

if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis").createClient(rtg.port, rtg.hostname);
} else {
  var redis = require('redis').createClient(process.env.REDIS_PORT || null, process.env.REDIS_HOST || null);
}

redis.on('connect', function() {
  console.log('Connected to Redis');
});

if(typeof process.env.REDIS_AUTH !== "undefined") {
  redis.auth(process.env.REDIS_AUTH, function(err) {
    if(err) return console.log(err);
    console.log('Redis Authenticated');
    startWorker();
  });
} else if (process.env.REDISTOGO_URL) {
  redis.auth(rtg.auth.split(":")[1]);
  startWorker();
} else {
  startWorker();
}

// Web (Express) Setup
app.configure(function(){
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
