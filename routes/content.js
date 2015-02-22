var Store = require("jfs");
var express = require('express');
var router = express.Router();
var db = new Store("data",{type:'single'});
var fs = require('fs');

router.get("/", function(req, res) {
  db.get(req.query.id, function(err, obj) {
    if(err) {
      fs.readFile('./content/default.gif', function(err, data) {
        if (err) throw err;

        res.writeHead(200, {
          'Expires': 'Sat, 26 Jul 1997 05:00:00 GMT',
          'Last-Modified': (new Date()).toUTCString(),
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0',
          'Pragma': 'no-cache',
          'Content-Type': 'image/gif'
        });

        res.end(data);
      });
      return;
    }

    if(obj.read == false) {

      db.save(req.query.id, {read:true}, function(err){});

      fs.readFile('./content/' + req.query.id + '.gif', function(err, data) {
        if (err) throw err;

        res.writeHead(200, {
          'Expires': 'Sat, 26 Jul 1997 05:00:00 GMT',
          'Last-Modified': (new Date()).toUTCString(),
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0',
          'Pragma': 'no-cache',
          'Content-Type': 'image/gif'
        });

        res.end(data);
      });
    }
    else {
      fs.readFile('./content/default.gif', function(err, data) {
        if (err) throw err;

        res.writeHead(200, {
          'Expires': 'Sat, 26 Jul 1997 05:00:00 GMT',
          'Last-Modified': (new Date()).toUTCString(),
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0',
          'Pragma': 'no-cache',
          'Content-Type': 'image/gif'
        });

        res.end(data);
      });
    }
  });
});

module.exports = router;