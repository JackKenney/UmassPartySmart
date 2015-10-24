//CLIENT SIDE SCRIPTS
var tableShown = false;

// >>>SERVER HANDSHAKE<<< 
//  Connect to server
var socket = io('/');
console.log(socket);

//  Handler for info replies
socket.on('info', function(data) {
  console.log(data);
});

//  Handler for query response
socket.on('query-response', function( reply ) {
  console.log('Client Query Response!');
  buildTable(reply);  
});
// >>>END SERVER HANDSHAKE<<<


// MAIN ROUTINE, RUNS ON DOCUMENT LOAD

$(document).ready( function () {
  //FIELDS:
  var firstNameIn = $(document.getElementById('first_name'),
      lastNameIn = $(document.getElementById('last_name'),
      studentIn = $(document.getElementById('student_id'),
      phoneIn = $(document.getElementById('phone_number'),
      phoneIn2 = $(document.getElementById('phone_number2'),
      addressIn = $(document.getElementById('address'),
      address2In = $(document.getElementById('address2'),
      cityIn = $(document.getElementById('city'),
      stateIn = $(document.getElementById('state'),
      zipIn = $(document.getElementById('zipcode'),
      dateIn = $(document.getElementById('date'),
      timeIn = $(document.getElementById('time'),

      submitButton = $(document.getElementById('submit');

  //if display button is clicked, fetch table data and build table
  submitButton.on('click', function() { //first_name, last_name, student_id, phone, address, date, time 
    console.log('Submit Button Clicked');
    var data = { 
          'first_name':firstNameIn.val(),
          'last_name':lastNameIn.val(),
          'student_id':studentIn.val(),
          'phone':phoneIn.val(),
          'phone2':phoneIn2.val(),
          'address':addressIn.val(),
          'address2':address2In.val(),
          'city':cityIn.val(),
          'zip':zipIn.val(),
          'date':dateIn.val(),
          'time':timeIn.val()
        };
    socket.emit('registration',data);
    console.log('Registration Submitted');      
  });
//SOCKET INTERACTIONS
  //how client deals with Response Data
  socket.on('registration-confirmation', function(rows) {
    console.log("Registration Recieved!");
  });
});

