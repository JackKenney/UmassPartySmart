//SERVER
//basic setup w/ express and io
var express = require('express'),
    app = express(),
    http = require( 'http' ).Server( app ),
//sockets
    io = require('socket.io')(http),
//database
    mysql = require( 'mysql' ),
    connection = mysql.createConnection('mysql://root:password@localhost/Parties'),
//email client
    mandrill = require('node-mandrill')('nq8e1lZhVI_LMO-0hy5mog');
//server listens on port 1337
http.listen(1337);


//connect to database
connection.connect();
console.log('Database Connection Established!');

io.on('connection', function(socket) {
  console.log('Connection to Client Established!');
  var dateObj = new Date();
  var month = dateObj.getUTCMonth(),
      day = dateObj.getUTCDate(),
      year = dateObj.getUTCFullYear();
  var today = new Date(year,month,day),
      sql = "SELECT party_id, date FROM Parties";
  connection.query(sql, function(err, rows, fields) {
    if(err) console.log(err);
    else {
      for(var o in rows) {
        check = new Date(rows[o].date);
        if(check < today) {
          connection.query("DELETE FROM Parties WHERE party_id=" + rows[o].party_id);
        }
      }
    }
  });

  //when the display button is clicked, this request is sent to retreive current database information.
  socket.on('registration', function(data) { //{first_name,last_name,student_id,phone,address,date,time}
    console.log('Registration request recieved!');
    var sql = "SELECT provider_id FROM Providers WHERE name=\"" + data.provider + "\"",
        provID;
    connection.query(sql, function(err,rows,fields) {
      console.log("1 "+ rows);
      if(err) console.log(err);
      else provID = rows[0].provider_id;
      console.log("2 "+provID);
      sql = "INSERT INTO Parties (student_id, first_name, last_name, phone, provider_id, address, address2, city, state, zipcode, date, time) VALUES(";
      sql += "\"" +data.student_id+ "\",";
      sql += "\"" +data.first_name+ "\",";
      sql += "\"" +data.last_name+ "\",";
      sql += "\"" +data.phone+ "\",";
      sql += "\"" +provID+ "\",";
      sql += "\"" +data.address+ "\",";
      sql += "\"" +data.address2+ "\",";
      sql += "\"" +data.city+ "\",";
      sql += "\"" +data.state+ "\",";
      sql += "\"" +data.zip+ "\",";
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
  });

  //when a new post is submitted, the sql is sent to the database through here and errors are returned.
  socket.on('police-query', function(data) { //{address,address2,city,state,zip}
    console.log('New Police Query Received!');
    var sql_start =  "SELECT first_name, phone, date FROM Parties WHERE ";
    populateSearch(sql_start, data, function(sql) {
    //Query Database to return party info
      connection.query(sql, function(err,rows,fields) {
        if(err) console.log(err);
        else {
          var result = [],
              rowCount = 0;  
          for(var i=0;i<rows.length;i++) { //remove all parties that are not happening today
            if(today.getTime() == rows[i].date.getTime()) {
              result[rowCount] = rows[i];
              rowCount++;
            }
          }
          var result = { rows:result };
          console.log(result);
          io.emit('police-response', result);
        }
      });
    });
    console.log("Police Response Sent!"); 
  });
  //End Police Sockets

  //Start Complaint Sockets
  socket.on('text-info-query', function(data) { // {address,address2,city,state,zip}
    console.log('Text-info Recieved!');
    var sql_start = "SELECT Providers.extension, Parties.phone, Parties.date FROM Parties JOIN Providers ON Parties.provider_id = Providers.provider_id WHERE ";
    populateSearch(sql_start, data, function(sql) {
      console.log(sql);
      connection.query(sql, function(err,rows,fields) {
        if(err) console.log(err);
        else { // (hopefully) rows is [ { extension,phone } ]
          for(var i=0; i<rows.length; i++) {
            var obj = rows[i];
              sendText(obj.phone,obj.extension,"","Hi, this is your courtesy text. Your party is too loud, please tone it down because your neighbors are ready to contact the authorities.");
          }
        }
      }); 
    });
  });
  
  //Begin Delivery Interactions:
  socket.on('delivery-query', function() {
    var sql = "SELECT first_name, last_name, phone, address, address2, city, state, zipcode, date, time, delivery_status FROM Parties WHERE date<" + (today.getTime()+604800000);
    connection.query(sql, function(err,rows,fields) {
      if(err) console.log(sql);
      else {
        console.log(rows);
      }
    });
  });
}); //END OF SOCKETS
//Adjunct function to Send text to given number through provider's email client
function sendText (_number, _extension, _subject, _message ) {
  var email = "";
  email += _number + _extension;
  mandrill('/messages/send', {
    message: {
        to: [{'email':email},{name:'Party Host'}],
        from_email: 'noreply@partysmart.com',
        subject:"UMass Party Smart",
        text:_message
    }    
  }, function(error, response) {
    if(error) console.log(error);
    else console.log(response);
  });
}
//End Complaint Sockets


//Adjunct function, abstracted for efficiency, to provide sql database search WHERE clauses from JSON files
function populateSearch(sql_start, data, callback) { // {address,address2,city,state,zip}
  var sql = sql_start;
  //Address Line 1
  if(data.address!="") {
    sql += "address LIKE \'%" + data.address + "%\'";
    sql += " AND ";
  }
  //Address Line 2
  if(data.address2!="") {
    sql += "address2 LIKE \'%" + data.address2 + "%\'";
    sql += " AND ";
  }
  //City Line
  if(data.city!="") {
    sql += "city LIKE \'%" + data.city + "%\'";
    sql += " AND ";
  }
  //State Line
  if(data.state!="") {
    sql += "state LIKE \'%" + data.state + "%\'";
    sql += " AND ";
  }
  //Zipcode line
  if(data.zip!="") {
    sql += "zipcode LIKE \'%" + data.zip + "%\'";
    sql += " AND ";
  }
  sql = sql.substring(0,sql.length-4) + ';';
  callback(sql);
}

//send page to address on req. to default directory
  app.use(express.static(__dirname + '/public'));

