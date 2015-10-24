//SERVER
//basic setup w/ express and io
var express = require('express'),
    app = express(),
    http = require( 'http' ).Server( app ),
//sockets
    io = require('socket.io')(http),
//database
    mysql = require( 'mysql' ),
    connection = mysql.createConnection('mysql://root:password@localhost/Parties');
//server listens on port 1337
http.listen(1337);


//connect to database
connection.connect();
console.log('Database Connection Established!');

io.on('connection', function(socket) {
  console.log('Connection to Client Established!');

  //when the display button is clicked, this request is sent to retreive current database information.
  socket.on('registration', function(data) { //{first_name,last_name,student_id,phone,address,date,time}
    console.log('Registration request recieved!');
    var sql = "INSERT INTO parties (student_id, first_name, last_name, phone, phone2, address, address2, city, zipcode, date, time) VALUES(";
    sql += "\"" +data.student_id+ "\",";
    sql += "\"" +data.first_name+ "\",";
    sql += "\"" +data.last_name+ "\",";
    sql += "\"" +data.phone+ "\",";
    sql += "\"" +data.phone2+ "\",";
    sql += "\"" +data.address+ "\",";
    sql += "\"" +data.address2+ "\",";
    sql += "\"" +data.city+ "\",";
    sql += "\"" +data.zip+ "\",";
    sql += "\"" +data.date+ "\",";
    sql += "\"" +data.time+ "\");";
    connection.query(req.sql, function(err,rows,fields) {
      if(err) io.emit('info', err);
      else {
        io.emit('resgistration-confirmation', rows);
        console.log("Registration Response Recieved By Server");
      }
    });
  });

  //when a new post is submitted, the sql is sent to the database through here and errors are returned.
  socket.on('new-postData', function(req) {
    console.log('New Post Submission Received!: '+req.sql);
    if(req.sql!=="") {
    connection.query(req.sql, function(err,rows,fields) {
        if(err) io.emit('info', err);
        else {
          console.log("New Post Added to Database!");
        }
      });
    }
    else console.log("No new post added to Database.");
  });
});


//send page to address on req. to default directory
  app.use(express.static(__dirname + '/public'));

