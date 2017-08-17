require('dotenv').config();
var express = require('express'),
    mongo = require('mongodb').MongoClient,
    JSONStream = require('JSONStream'),
    fs = require('fs'),
    request = require('request');

var ACCESS_TOKEN = '';

var app = express();

/*
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
*/

app.get('/yelp/', function(req, res) {
    res.writeHead(200, { 'content-type': 'text/html' })
    var fileStream = fs.createReadStream('./public/index.html');
    fileStream.pipe(res);
});

function authApp() {
    if (!ACCESS_TOKEN) {
        request.post(
            'https://api.yelp.com/oauth2/token', {
                form: {
                    client_id: process.env.CLIENT_ID,
                    client_secret: process.env.CLIENT_SECRET
                }
            },
            function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var data = JSON.parse(body);
                    ACCESS_TOKEN = data.access_token;
                    fs.writeFile(".token", data, function(err) {
                        if (err) {
                            return console.log(err);
                        }
                    });
                }
            }
        );
    }
}

app.get('/yelp/reviews/:id/:locale', function(req, res) {
    var value = req.params.id;
    var url = 'https://api.yelp.com/v3/businesses/'+encodeURIComponent(req.params.id)+'/reviews';
    request.get({
            url: url,
            headers: {
                Authorization: ' Bearer ' + ACCESS_TOKEN
            },
            qs: {
                locale: req.params.locale
            }
        },
        function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);
                res.send(data.reviews);
            } else {
                res.send([]);
            }
        }
    );
});

app.get('/yelp/search/:loc/:offset', function(req, res) {
    var location = req.params.loc;
    var limit = 10;
    var long = '';
    var lat = '';
    var offs= req.params.offset*limit;
    return makeRequest(location, long, lat, offs, limit, res);
});

app.get('/yelp/search/:lat/:long/:offset', function(req, res) {
    var location = '';
    var limit = 10;
    var long = req.params.long;
    var lat = req.params.lat;
    var offs= req.params.offset*limit;
    return makeRequest(location, long, lat, offs, limit, res);
});

function makeRequest(loc, long, lat, off, limit, res) {
    return request.get({
        url: 'https://api.yelp.com/v3/businesses/search',
        headers: {
            Authorization: ' Bearer ' + ACCESS_TOKEN
        },
        qs: {
            //locale: 'es_ES',
            limit: limit,
            location: loc,
            latitude: lat,
            longitude: long,
            offset: off,
            categories: 'nightlife'
        }
        },
        function(error, response, body) {
            var data = JSON.parse(body);
            if (!error && response.statusCode == 200) {
                res.send(data.businesses);
            } else {
                res.send(error);
            }
        }
    );
}

app.listen(process.env.PORT, function() {
    authApp();
    console.log('Yelp API Server listening on port ' + process.env.PORT + '!');
});
