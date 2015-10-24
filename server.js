//SERVER
//basic setup w/ express and io
var express = require('express'),
    app = express(),
    http = require( 'http' ).Server( app ),
//sockets
    io = require('socket.io')(http),
//database
    mysql = require( 'mysql' ),
    connection = mysql.createConnection('mysql://root:sqlroot123@localhost/test');
//server listens on port 1337
http.listen(1337);


//connect to database
connection.connect();
console.log('Database Connection Established!');

io.on('connection', function(socket) {
  console.log('Connection to Client Established!');

  //when the display button is clicked, this request is sent to retreive current database information.
  socket.on('query-postData', function(req) {
    console.log('Query for Post Data Received!');
    connection.query(req.sql, function(err,rows,fields) {
      if(err) io.emit('info', err);
      else {
        io.emit('query-responseData', rows);
        console.log("Server postData Query Response Emitted!");
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

