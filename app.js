
const express = require('express');
const bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 


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

      setTimeout(function() { conn.close();}, 500);
    });
  });

})

module.exports = app;