var fs          = require('fs');
var _           = require('underscore');
var exphbs      = require('express-handlebars');
var express     = require('express');
var moment      = require('moment')

////////////////////////////////////////////////////////////////////////////////
// ENV Setup
////////////////////////////////////////////////////////////////////////////////
require('dotenv').config()

////////////////////////////////////////////////////////////////////////////////
// Important Globals
////////////////////////////////////////////////////////////////////////////////
var app;
var server;
var db;
var renderer;

var twilio_client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN, {
	logLevel: undefined
})

var startMessage = "Howdy! This is the party hotline!\n"
startMessage += "Reply 'A' if free Jul 30th\n"
startMessage += "Reply 'B' if free Aug 13th\n"
startMessage += "Reply 'both' if free both days!\n"
startMessage += "See you there!"


////////////////////////////////////////////////////////////////////////////////
// Main
////////////////////////////////////////////////////////////////////////////////

var setup = function() {
    setupApp();
    registerPaths();
    registerStatic();
    start();
}

var setupApp = function() {
    app = express();
    app.engine('html', exphbs({
        extname:    '.html',
        layout:     false,
        defaultLayout: null
    }));
    app.set('view engine', 'html');

	app.use(express.json()); // to support JSON-encoded bodies
	app.use(express.urlencoded({extended: true})); // to support URL-encoded bodies
}

var registerPaths = function() {
    app.get('/', function(req, res) {
        res.render('main',{})
    });

    app.post('/phonenumber', function(req, res) {
    	var phoneNumber = req.body.phone_number;
    	var personName = req.body.person_name;

    	twilio_client.lookups.v1.phoneNumbers(phoneNumber).fetch()
            .then(function(response) {
                if(response.phoneNumber == undefined) {
                    throw err;
                    return;
                }

         		var trueNumber = response.phoneNumber;
                console.log(response)
         		// bail out quick!
                console.log('sent 200')
         		res.status(200).send();

         		// log the number for our records
         		var logLine = trueNumber + ', ' + personName + ', ' + moment().format() + '\n';
         		fs.appendFileSync(__dirname + '/numbers.txt', logLine);

         		// send the text with the vote prompt
         		twilio_client.messages.create({        
                    messagingServiceSid: process.env.TWILIO_MSG_SID, 
                    to: trueNumber,
                    body: startMessage
                }).done();

         	}).catch(function(error) {
         		console.log('error!')
         		res.status(300).send();
            });
    })

    app.post('/suggestionbox', function(req, res) {
    	var suggestion = req.body.band_name;
    	var personName = req.body.your_name;

		// log the number for our records
    	var logLine = suggestion + ', ' + personName + ', ' + moment().format() + '\n'
    	fs.appendFileSync(__dirname + '/suggestions.txt', logLine)

        res.status(200).send();
    })

    app.get('/incoming', function(req, res) {

        if(! (_.has(req.query, 'From') && _.has(req.query, 'Body'))) {
            console.log("didn't get what I needed")
            res.status(200).end()
            return;
        }

	    console.log(req.query.From);
	    console.log(req.query.Body);

        var from_number = req.query.From[0];
        var body = req.query.Body[0];
        body.trim();
        body = body.toLowerCase();

	    console.log(body)

        console.log(from_number, body)

        // log the vote for our records
    	var logLine = from_number + ', ' + body + ', ' + moment().format() + '\n'
    	fs.appendFileSync(__dirname + '/votes.txt', logLine)

        if(body == 'a') {
			twilio_client.messages.create({        
                messagingServiceSid: process.env.TWILIO_MSG_SID, 
                to: from_number,
                body: 'Got it, you\'re free on the 30th!'
            }).done();
            res.status(200).end();
            return;
        }

        if(body == 'b') {
			twilio_client.messages.create({        
                messagingServiceSid: process.env.TWILIO_MSG_SID, 
                to: from_number,
                body: 'Got it, you\'re free on the 13th!'
            }).done();
            res.status(200).end();
            return;
        }

        if(body == 'both') {
			twilio_client.messages.create({        
                messagingServiceSid: process.env.TWILIO_MSG_SID, 
                to: from_number,
                body: 'Ooh, look how flexible you are!'
            }).done();
            res.status(200).end();
            return;
        }

		twilio_client.messages.create({        
            messagingServiceSid: process.env.TWILIO_MSG_SID, 
            to: from_number,
            body: 'Look, I coded this in an afternoon. You gotta say "A", "B", or "both"!'
        }).done();
        res.status(200).end();
        return;        
    })

}

var registerStatic = function() {
    app.use('/static/styles/', express.static(__dirname + '/views/styles/'));
    app.use('/static/scripts/', express.static(__dirname + '/views/scripts/'));
    app.use('/static/images/', express.static(__dirname + '/views/images/'));
}

var start = function() {
    server = app.listen(4000);
}

setup();