require('dotenv').config();
var express = require('express'),
    mongo = require('mongodb').MongoClient,
    JSONStream = require('JSONStream'),
    fs = require('fs'),
    request = require('request');

var ACCESS_TOKEN = '';

var app = express();

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

app.get('/yelp/search/*', function(req, res) {
    var value = req.params[0];
    request.get({
            url: 'https://api.yelp.com/v3/businesses/search',
            headers: {
                Authorization: ' Bearer ' + ACCESS_TOKEN
            },
            qs: {
                locale: 'es_ES',
                location: value
            }
        },
        function(error, response, body) {
            var data = JSON.parse(body);
            if (!error && response.statusCode == 200) {
                res.send(data.businesses);
            } else {
                res.send(data.error.description);
            }

        }
    );
});

app.listen(process.env.PORT, function() {
    authApp();
    console.log('Yelp API Server listening on port ' + process.env.PORT + '!');
});