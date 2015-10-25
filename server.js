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
  var date = new Date().getTime(),
      check,
      sql = "SELECT party_id, date FROM Parties";
  connection.query(sql, function(err, rows, fields) {
    if(err) console.log(err);
    else {
      for(var o in rows) {
        check = new Date(rows[o].date.toString());
        if(check < date) {
          console.log(rows[o].party_id)
          connection.query("DELETE FROM Parties WHERE party_id=" + rows[o].party_id);
        }
      }
    }
  });

  //when the display button is clicked, this request is sent to retreive current database information.
  socket.on('registration', function(data) { //{first_name,last_name,student_id,phone,address,date,time}
    console.log('Registration request recieved!');
    console.log(data.date);
    var sql = "INSERT INTO Parties (student_id, first_name, last_name, phone, phone2, address, address2, city, state, zipcode, date, time) VALUES(";
    sql += "\"" +data.student_id+ "\",";
    sql += "\"" +data.first_name+ "\",";
    sql += "\"" +data.last_name+ "\",";
    sql += "\"" +data.phone+ "\",";
    sql += "\"" +data.phone2+ "\",";
    sql += "\"" +data.address+ "\",";
    sql += "\"" +data.address2+ "\",";
    sql += "\"" +data.city+ "\",";
    sql += "\"" +data.zip+ "\",";
    sql += "\"" +data.state+ "\",";
    sql += "\"" +data.date+ "\",";
    sql += "\"" +data.time+ "\");";
    connection.query(sql, function(err,rows,fields) {
      if(err) { io.emit('info', err);console.log(err); }
      else {
        io.emit('registration-confirmation', rows);
        console.log("Registration Response Recieved By Server");
      }
    });
  });

  //when a new post is submitted, the sql is sent to the database through here and errors are returned.
  socket.on('police-query', function(data) { //{address,address2,city,state,zip}
    console.log('New Police Query Received!');

    //Returns all rows associated with that address.
    var sql = "SELECT first_name, phone FROM Parties WHERE ",
        result;
    
    //Address Line 1
    if(data.address!="") {
        sql += "address LIKE \'%" + data.address + "%\'";
        sql += " OR ";
    }
    //Address Line 2
    if(data.address2!="") {
        sql += "address2 LIKE \'%" + data.address2 + "%\'";
        sql += " OR ";
    }
    //City Line
    if(data.city!="") {
        sql += "city LIKE \'%" + data.city + "%\'";
        sql += " OR "; 
    }
    //State Line
    if(data.state!="") {
        sql += "state LIKE \'%" + data.state + "%\'";
        sql += " OR ";
    }
    //Zipcode line
    if(data.zip!="") {
        sql += "zipcode LIKE \'%" + data.zip + "%\'";
        sql += " OR ";
    }
    sql = sql.substring(0,sql.length-4) + ';';
    console.log(sql);
    //Query Database to return party info
    connection.query(sql, function(err,rows,fields) {
      if(err) console.log(err);
      else {  
        result = { 'rows':rows };
        console.log(result);
        io.emit('police-response', result);
      }
    });
    console.log("Police Response Sent!"); 
  });
});
//send page to address on req. to default directory
  app.use(express.static(__dirname + '/public'));

