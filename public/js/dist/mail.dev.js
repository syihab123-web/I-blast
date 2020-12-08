"use strict";

var nodemailer = require('nodemailer');

var http = require('http');

var xoauth2 = require('xoauth2');

var qs = require('querystring');

var schedule = require('node-schedule');

var formidable = require('formidable');

var fs = require('fs');

var csv = require('csv-parser');

var mysql = require('mysql');

var multer = require('multer');

var path = require('path');

var conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'i_blast'
});

var PubNub = require("pubnub");

var pubnub = new PubNub({
  subscribe_key: 'demo',
  // always required
  publish_key: 'demo' // only required if publishing

});

function send_percentage(percentage) {
  pubnub.publish({
    channel: "progress-bar",
    message: {
      "value": percentage
    },
    callback: function callback(m) {
      console.log(m);
    }
  });
}

conn.connect(function (err) {
  if (err) throw err;
  console.log('Mysql Connected...');
});
var storage = multer.diskStorage({
  destination: path.join(__dirname + './../public/files/'),
  filename: function filename(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
var upload = multer({
  storage: storage
}).single('attach');
var file = 'receivers/' + Date.now();
http.createServer(function (req, res) {
  if (req.url === "/email/sendEmail" && req.method === "POST") {
    var trigger_sending = function trigger_sending(env) {
      //env passes our email and name to //customize the message
      try {
        //route untuk insert data
        var _data = {
          from: POST.from,
          to: env.email,
          subject: POST.subject,
          pesan: POST.pesan,
          created_at: new Date(),
          user: POST.user
        };
        var sql = "INSERT INTO email SET ?";
        var query = conn.query(sql, _data, function (err, results) {
          if (err) throw err;
        }); //generates a string to send  //the personalized

        mailOpts = {
          from: POST.from,
          //grab form   data from the request body object
          to: env.email,
          subject: POST.subject,
          html: POST.pesan,
          attachments: [{
            filename: attach.name,
            path: attach.path
          }]
        };
        smtpConfig.sendMail(mailOpts, function (error, response) {
          //Email not sent
          if (error) {} //res.render('contact', { title: 'Raging Flame Laboratory - Contact',   msg: 'Error occured, message not sent.', err: true, page: 'contact' })
          //console.log("error");
          //Yay!! Email sent
          else {//res.render('contact', { title: 'Raging Flame Laboratory - Contact',  msg: 'Message sent! Thank you.', err: false, page: 'contact' })
              //console.log("success");
            }
        });
      } catch (e) {
        console.log(e);
      }
    };

    var set_message_delays = function set_message_delays() {
      try {
        var message_job = schedule.scheduleJob('*/2 * * * * *', function () {
          console.log(sendlist[message_increment]);
          trigger_sending(sendlist[message_increment]);

          if (message_increment < sendlist.length) {
            message_increment++;
          }

          if (message_increment >= sendlist.length) {
            fs.unlink(file, function (err) {
              if (err) {
                console.error(err);
                return;
              }

              console.log("File Terhapus"); //file removed
            });
            res.writeHead(302, {
              'Location': 'http://127.0.0.1:8000/email/'
            });
            res.end();
            send_percentage(total_data * message_increment);
            message_job.cancel();
          }

          var total_data = 100 / sendlist.length;
          send_percentage(total_data * message_increment);
        });
      } catch (e) {
        console.log(e);
      }
    };

    var get_list = function get_list() {
      fs.createReadStream(file).pipe(csv()).on('data', function (row) {
        console.log(row);
        sendlist.push(row);
      }).on('end', function () {
        console.log('CSV file successfully processed');
        set_message_delays();
      });
    };

    var form = new formidable.IncomingForm();
    var data = null;
    var POST = null;
    var attach = null;
    form.parse(req, function (err, fields, files) {
      try {
        data = JSON.stringify(files.email);
        POST = fields;
        attach = JSON.stringify(files.attach);
        console.log("parsed1 : " + data);
        data = JSON.parse(data);
        attach = JSON.parse(attach);
        console.log("Path Attach : " + attach.path);
        console.log("Parsed2 : " + data);
        console.log(data.path);
        fs.rename(data.path, file, function (err) {
          if (err) console.log(err);
        });
      } catch (e) {
        console.log(e);
      }
    });
    var mailOpts, smtpConfig; //Setup Nodemailer transport, I chose gmail. Create an application-specific             password to avoid problems.

    smtpConfig = nodemailer.createTransport({
      service: 'Gmail',
      port: 465,
      auth: {
        user: "syihabudin234@gmail.com",
        pass: "uvavlkyxqudasjst"
      }
    }); //Mail options

    smtpConfig.verify(function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log('Server is ready to take our messages');
        get_list(); // trigger the whole app once the mail server is ready
      }
    });
    var sendlist = [];
    var message_increment = 0;
  }
}).listen(8081);
console.log("listening to port 8081");