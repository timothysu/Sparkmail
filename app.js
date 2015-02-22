var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Store = require('jfs');
var uuid = require('node-uuid');
var gm = require('gm');
var imageMagick = gm.subClass({ imageMagick: true });

var routes = require('./routes/index');
var users = require('./routes/users');
var content = require('./routes/content')

var app = express();
var db = new Store("data",{type:'single'});

// IMAP for Receiving emails
var notifier = require('mail-notifier');
var imap = {
  user: "mchacksmymail",
  password: "mchacks12345",
  host: "imap.gmail.com",
  port: 993, // imap port
  tls: true,// use secure connection
  tlsOptions: { rejectUnauthorized: false }
};

var serverconfig = JSON.parse(require('./serverConfig.js')());

// SMTP for Sending Emails
var nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'mchacksmymail@gmail.com',
        pass: serverconfig.password
    }
});

// Mail was Received
notifier(imap).on('mail',function(mail){
    // TODO: Parse Receiver from subject AND use regex to ensure valid email (has @ and .)

    // Generate UUID
    var userid = uuid.v4();

    // Parse text body, generate the gif - save it somewhere
    // TODO: Change to characters per line, but not breaking on a word
    var text = mail.text;
    var x = 15,
			  y = 30,
			  wrdsPerLine = 9
        fontSize = 16;
    var wrdArray = text.split(' ');
    var wrdCount = wrdArray.length,
			lines = Math.ceil(wrdCount / wrdsPerLine),
			height = lines*70;
      var newArray = [];
      for (var i=0,  tot=wrdArray.length; i < tot; i++) {
        if(i % 9 == 0 && i != 0) {
          newArray.push("\n\n");
        }
        newArray.push(wrdArray[i]); //"aa", "bb"
      }
    var newText = newArray.join(' ');
    //newText = newText.replace(/,/g , " ");

          imageMagick(480, height, "#FFFFFF")
          .font('n021003l.pfb')
          .fontSize(fontSize)
          .drawText(x, y, newText)
          .write("./content/" + userid + ".gif", function (err) {
            if(err) {
              console.log(err);
            }
          });


    // TODO: Put into database with starting flags
    db.save(userid, {read: false}, function(error) {
      if(error) {
        console.log(error);
      }
    });

    // TODO: Create html w/ headers, stick the 1x1 pixel and gif in it
    var sender = mail.from[0].address;
    var intendedReceiver = mail.subject.trim();
    console.log("Sender: " + sender);
    console.log("Receiver: " + JSON.stringify(intendedReceiver, null, 2));

    var mailOptions = {
        from: sender + ' via Sparkmail <send@sparkmail.me>', // sender address
        to: intendedReceiver, // list of receivers
        subject: 'New McHackMyMail from '+ sender, // Subject line
        //text: 'Hello world ✔', // plaintext body
        //html: '<b>'+text+'</b>' // html body
        html: "<img src='http://sparkmail.me/content.gif?id=" + userid + "'>"
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent ' + sender + ' -> ' + intendedReceiver/* + info.response*/);
        }
    });
    console.log(JSON.stringify(mail, null, 2));;}
    ).start();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/content.gif', content);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
