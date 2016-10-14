// Dependencies
var http = require('http');
var express = require('express');
var morgan = require('morgan');    
var fs = require('fs');
var Datastore = require('nedb')
  , db = new Datastore();


// Initialize OpenTok


var app = express();

app.set('port', (process.env.PORT || 8000));


//app.use(morgan('combined'));
// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(morgan('common', {
    stream: fs.createWriteStream('./access.log', {flags: 'a'})
}));
app.use(morgan('dev'));
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header( 'Access-Control-Allow-Credentials: true' );
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });


// // This responds a GET request for the /list_user page.
// app.get('/connection/:sessionId/:username', function (req, res) {
//    console.log("get connectionId by sessionId");
//    var tokenOptions = {};
//    tokenOptions.role = "publisher";
//    tokenOptions.data = JSON.stringify({username:req.params.username});

//     // Generate a token.
//    token = opentok.generateToken(req.params.sessionId, tokenOptions);
//    res.end( JSON.stringify({
// 					    "apiKey": apiKey,
// 					    "sessionId": req.params.sessionId,
// 					    "token": token
// 	}));
// });



// app.get('/', function(req, res) {
//   console.log("get home pages");
//   res.render('index.html');
// });
app.use(express.static(__dirname + '/'));

var server = http.createServer(app);
server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});