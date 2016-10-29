// Dependencies
var http = require('http');
var express = require('express');
var morgan = require('morgan');    
var fs = require('fs');
var Datastore = require('nedb')
  , db = new Datastore();
var MobileDetect = require('mobile-detect');
var bodyParser = require('body-parser'); 
var jwt = require('jsonwebtoken');
// Initialize OpenTok
var moment = require('moment');
var nodemailer = require('nodemailer');
var compression = require('compression');

var secretkey = "brilyhomesupersecret"; 

var privatekey = ''

var poolSmtpConfig = {
    pool: true,
    host: 'hwsmtp.exmail.qq.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'sales@oceanparksf.com',
        pass: 'Cup3rt1n0'
    }
};

var transporter = nodemailer.createTransport(poolSmtpConfig);


var app = express();

app.set('port', (process.env.PORT || 8000));



//app.use(morgan('combined'));
// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.use(compression());

app.use(morgan('common', {
    stream: fs.createWriteStream('./access.log', {flags: 'a'})
}));
app.use(morgan('dev'));



app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


// app.get('/*', function (req, res, next) {

//   if (req.url.indexOf("/images/") === || req.url.indexOf("/css/") === 0 || req.url.indexOf("/3rdparty/") === 0 || req.url.indexOf("/revolution/") === 0 ) {
//     res.setHeader("Cache-Control", "public, max-age=2592000");
//     res.setHeader("Expires", new Date(Date.now() + 2592000000).toUTCString());
//   }
//   next();
// });

var static_server_opt = {
  'maxAge': 2592000000
}
//app.use(express.static(__dirname + '/'));
app.use('/revolution', express.static(__dirname + '/revolution'));
app.use('/3rdparty', express.static(__dirname + '/3rdparty'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/logo', express.static(__dirname + '/logo'));


// POST http://localhost:8080/api/users
// parameters sent with 
app.post('/infopost', function(req, res) {
    var name = req.body.name;
    var token = req.body.token;
    var email = req.body.email;
    var phone = req.body.phone;
    var message = req.body.message;
    var address = req.body.address;
    if(address){
      var rt = {status: 'notok'};
      res.send(JSON.stringify(rt));
    }
    else{
      verifyToekn(token, function(err){
        if(err){
          console.log(err);
          var rt = {status: 'notok'};
          res.send(JSON.stringify(rt));
        }
        else{
          var rt = {status: 'ok'};
          var msg = {
                      "token": token,
                      "name" : name,
                      "email" : email ,
                      "phone": phone,
                      "message" : message
                    };
          sendEmail(msg, function(err){
            res.send(JSON.stringify(rt));
            console.log(JSON.stringify(msg));
          });
        }
      });
    }
    
});



app.get('/simple', function(req, res) {
  console.log("get simple pages");
  var md = new MobileDetect(req.headers['user-agent']);
  res.render('simple', {"md": md});
});

app.get('/whoiswho', function(req, res){
  var tk = generateToken();
  res.send(tk);
});

app.get('/', function(req, res) {
  console.log("get models pages");
  var md = new MobileDetect(req.headers['user-agent']);
  var deviceType = (md.mobile() ? (md.tablet() ? 'tablet' : 'phone') : 'computer'); 
  var token = generateToken();
  res.render('index', {"deviceType": deviceType, "token": token});
});






var server = http.createServer(app);
server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


var generateToken = function (){
  //var currentTime = new Date().toISOString();
  var payload = {time: moment().format('YYYY-M-DD HH:mm:ss')};
  var token = jwt.sign(payload, secretkey, { expiresIn: '30d' }); //you can submit the form even after you open the page for 1 month :)
  return token;
}

var verifyToekn = function(token, cb){

  var decoded = jwt.verify(token, secretkey, function(err, decoded) {
    if (err) {
      /*
        err = {
          name: 'TokenExpiredError',
          message: 'jwt expired',
          expiredAt: 1408621000
        }
      */
      cb(err);
    }
    else{
      var lasttime = moment(decoded.time, 'YYYY-M-DD HH:mm:ss');
      var currentTime = moment();
      var seconds = currentTime.diff(lasttime, 'seconds');
      if (seconds < 5 ){
        cb("you are sneaky bot");
      }
      else{
        cb(null)
      }
    }
  });

}

var sendEmail = function(message, cb){
  // setup e-mail data with unicode symbols
  message.timestamp = moment().format();
  var sub = "New Message";
  if( message.name){
    sub += " " + message.name;
  }
  if( message.phone ){
    sub += " " + message.phone;
  }
  if( sub == "New Message"){
    sub += "  "  + message.timestamp;
  }

  var msgtxt = "name: " + message.name + "\n" + 
               "phone: " + message.phone + "\n" +
               "email: " + message.email + "\n" +
               "message: " + message.message + "\n" + 
               "time: " + message.timestamp + "\n" + 
               "token: " + message.token;
  var msghtml = "name: " + message.name + "<br>" + 
               "phone: " + message.phone + "<br>" +
               "email: " + message.email + "<br>" +
               "message: " + message.message + "<br>" + 
               "time: " + message.timestamp + "<br>" + 
               "token: " + message.token;
  var mailOptions = {
      from: '"Sales" <sales@oceanparksf.com>', // sender address
      to: 'myao@brilyhome.com, sales@oceanparksf.com', // list of receivers
      subject: sub, // Subject line
      text: msgtxt, // plaintext body
      html: msghtml // html body
  };

  transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
        if(cb){
          cb(error);
        }
    }
    console.log('Message sent: ' + JSON.stringify(message) );
    console.log('Response: ' + info.response);
    if( cb){
      cb("ok");
    }
  });
}