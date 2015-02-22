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
var fs = require('fs');
var Mailjet = require('mailjet-sendemail');
var serverconfig = JSON.parse(require('./serverConfig.js')());
var mailjet = new Mailjet('8fdc575feda28f6e7ee48e3f34038b54', serverconfig.secret);

var routes = require('./routes/index');
var users = require('./routes/users');
var content = require('./routes/content')

var app = express();
var db = new Store("data",{type:'single'});

// IMAP for Receiving emails
var notifier = require('mail-notifier');
var imap = {
  user: "mchacksmymail",
  password: serverconfig.password,
  host: "imap.gmail.com",
  port: 993, // imap port
  tls: true,// use secure connection
  tlsOptions: { rejectUnauthorized: false }
};

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

    // TODO: Figure out how to handle images/attachments
    var attachments=null;
    var hasAttach=false;

    if(mail.attachments) {
      attachments=mail.attachments;
      mainAttach = attachments[0];
      if(mainAttach.contentType.indexOf("image") > -1) {
        hasAttach=true;
        filetype = mainAttach.contentType.substring(6);
        if(filetype != 'gif' || filetype != 'jpeg' || filetype != 'jpg' || filetype != 'png') {
          hasAttach=false;
        }
      }
    }

    // Parse text body, generate the gif - save it somewhere
    // TODO: Change to characters per line, but not breaking on a word
    var text = mail.text;
    var totalTime = 6;
    var x = 15,
			  y = 40,
			  wrdsPerLine = 12
        fontSize = 18;
    var wrdArray = text.split(' ');
    var wrdCount = wrdArray.length,
			lines = Math.ceil(wrdCount / wrdsPerLine),
			height = lines*70;
      var newArray = [];
      for (var i=0,  tot=wrdArray.length; i < tot; i++) {
        if(i % 12 == 0 && i != 0) {
          newArray.push("\n\n");
        }
        newArray.push(wrdArray[i]); //"aa", "bb"
      }
    var newText = newArray.join(' ');
    //newText = newText.replace(/,/g , " ");

    if(height < 350) {
      height = 350;
    }

    if(hasAttach) {
        fs.createWriteStream('./content/' + userid + 'raw.' filetype);
        gm.('./content/' + userid + 'raw.' filetype)
        .resize(540, height).write('./content/' + userid + 'pic.gif', function (err) {
          if(err) {
            console.log(err);
          }
        });
    }

    gm('./content/white_blank.gif')
    .resize(540, height, "!").write('./content/' + userid + '6temp.gif', function (err) {
      if(err) {
        console.log(err);
      }
    });

    fs.createReadStream('./content/default.gif').pipe(fs.createWriteStream('./content/' + userid + '7temp.gif'));
    //fs.createReadStream('./content/white_blank.gif').pipe(fs.createWriteStream('./content/' + userid + '6temp.gif'));

      for(var n=0; n < totalTime; n++) {

          imageMagick(540, height, "#FFFFFF")
          .font('n021003l.pfb')
          .fontSize(fontSize)
          .drawText(x, y, newText)
          .drawText(500, 25, (totalTime-n).toString())
          .write("./content/" + userid + n.toString() + "temp.gif", function (err) {
            if(err) {
              console.log(err);
            }
            if(n==totalTime) {
              imageMagick("./content/" + userid + "*temp.gif").loop('1').set('delay',100)
              .write("./content/" + userid + ".gif", function (err) {
                if(err) {
                  console.log(err)
                }
              });
            }
          });
        }

    // TODO: Put into database with starting flags
    db.save(userid, {read: false}, function(error) {
      if(error) {
        console.log(error);
      }
    });

    var sender = mail.from[0].address;
    var intendedReceiver = mail.subject.trim();

    //console.log("Sender: " + sender);
    //console.log("Receiver: " + JSON.stringify(intendedReceiver, null, 2));

    if(hasAttach) {
      var mailOptions = {
          from: sender + ' via Sparkmail <send@sparkmail.me>', // sender address
          to: intendedReceiver, // list of receivers
          subject: 'New Spark from '+ sender, // Subject line
          //text: 'Hello world ✔', // plaintext body
          //html: '<b>'+text+'</b>' // html body
          html: "<img src='http://sparkmail.me/content.gif?id=" + userid + "'><br /><img src='http://sparkmail.me/content.gif?id=" + userid + "pic'><br /><br />- Sparkmail"
      };
    }
    else {
      var mailOptions = {
          from: sender + ' via Sparkmail <send@sparkmail.me>', // sender address
          to: intendedReceiver, // list of receivers
          subject: 'New Spark from '+ sender, // Subject line
          //text: 'Hello world ✔', // plaintext body
          //html: '<b>'+text+'</b>' // html body
          html: "<img src='http://sparkmail.me/content.gif?id=" + userid + "'><br /><br />- Sparkmail"
      };
    }

    if(sender == "us@sparkmail.me") {
      mailjet.sendContent(mailOptions.from, mailOptions.to, mailOptions.subject, 'html', mailOptions.html);
    }
    else {
      transporter.sendMail(mailOptions, function(error, info){
          if(error){
              console.log(error);
          }else{
              console.log('Message sent ' + sender + ' -> ' + intendedReceiver);
          }
      });
    }
    //console.log(JSON.stringify(mail, null, 2));
    ;}
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
//app.use('/5cf53e3e8057acdda822d596dcbc7e7c.txt', users);

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
