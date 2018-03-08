//expressjs : framework to help organize your web application into an MVC architecture on the server side
const express = require('express');

/* body-parser extract the entire body portion of an incoming request stream and exposes it on req.body.
   body-parser module parses the JSON, buffer, string and URL encoded data submitted using HTTP POST request. */
const bodyParser = require('body-parser');

//create express app
var app = express();

/* tells the system whether you want to use a simple algorithm for shallow parsing (i.e. false)
or complex algorithm for deep parsing that can deal with nested objects (i.e. true). */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); //tells the system that you want json to be used.


app.post('/listen', function (req, res) {

  var keys = req.body.keys.toString().split(',');
  var amqp = require('amqplib/callback_api');
  amqp.connect('amqp://localhost', function (err, conn) {
    conn.createChannel(function (err, ch) {
      var exchange = 'hw3';

      ch.assertQueue('', { exclusive: true }, function (err, q) {

        keys.forEach(function (key) {
          ch.bindQueue(q.queue, exchange, key);
        });

        ch.consume(q.queue, function (msg) {
          res.status(200).json({
            msg: msg.content.toString()
          });

          conn.close();
        }, { noAck: true });
      });
    });
  });
})



app.post('/speak', function (req, res) {
  res.sendStatus(200);

  var key = req.body.key.toString();
  var msg = req.body.msg.toString();

  var amqp = require('amqplib/callback_api');

  amqp.connect('amqp://localhost', function (err, conn) {
    conn.createChannel(function (err, ch) {
      var ex = 'hw3';
      ch.publish(ex, key, new Buffer(msg));

      //for some reason, if we delete the line below, it doesn't work
      setTimeout(function() { conn.close();}, 500);
    });
  });

})

module.exports = app;