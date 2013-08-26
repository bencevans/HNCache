
/**
 * Module Dependencies
 */

var http = require('http');
var express = require('express');
var app = express();
var fs = require('fs');
var url = require('url');
var hn = require('hn.js');
var request = require('request');
var _ = require('underscore');
var config = require(__dirname + '/config.js');
var redis = require('./redis');
var worker = require('./worker');

/**
 * Express App Config
 */

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
  app.use(express['static'](__dirname + '/public'));
  app.use(require('express-errorstrap').notFound());
  app.use(require('express-errorstrap').error());
});

app.configure('development', function(){
  // app.use(express.errorHandler());
});


app.get('/:itemId', require('./routes/item'));

var server = http.createServer(app).listen(app.get('port'), function() {
  console.log('HNCache is listening on port ', app.get('port'));
});


/**
 * Worker Kickstart
 */

function startWorker() {
  worker.updateItems();
  setInterval(function() {
    worker.updateItems();
  }, 1000 * 60 * 10);
}

redis.on('connect', function() {
  startWorker();
});