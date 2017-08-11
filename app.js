var express = require('express'),
    mongo = require('mongodb').MongoClient,
    JSONStream = require('JSONStream'),
    fs = require('fs');


var app = express();

app.get('/yelp/', function(req, res) {
    res.writeHead(200, { 'content-type': 'text/html' })
    var fileStream = fs.createReadStream('./public/index.html');
    fileStream.pipe(res);
});

app.get('/yelp/search/*', function(req, res) {
    var value = req.params[0];
    var offset = req.query.offset;
    var rows = 10;
    var page = 0;
    res.send(JSON.stringify(data));
});

app.listen(8080, function() {
    console.log('Image Search Server listening on port 8080!');
});