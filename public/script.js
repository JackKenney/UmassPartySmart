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
  var firstNameIn = $(document.getElementById('first_name')),
      lastNameIn = $(document.getElementById('last_name')),
      studentIn = $(document.getElementById('student_id')),
      phoneIn = $(document.getElementById('phone_number')),
      phoneIn2 = $(document.getElementById('phone_number2')),
      addressIn = $(document.getElementById('address')),
      address2In = $(document.getElementById('address2')),
      cityIn = $(document.getElementById('city')),
      stateIn = $(document.getElementById('state')),
      zipIn = $(document.getElementById('zipcode')),
      dateIn = $(document.getElementById('date')),
      timeIn = $(document.getElementById('time')),

      submitButton = $(document.getElementById('submit')),
      
      conf = $(document.getElementById('conf')); //registration confirmation

  //When Registration Submit Button is Clicked:
  submitButton.on('click', function() {  
    console.log('Submit Button Clicked');
    var data = { 
          'first_name':firstNameIn.val(),
          'last_name':lastNameIn.val(),
          'student_id':studentIn.val(),
          'phone':phoneIn.val(),
          'phone2':phoneIn2.val(),
          'address':addressIn.val().toLowerCase(),
          'address2':address2In.val().toLowerCase(),
          'city':cityIn.val().toLowerCase(),
          'state':stateIn.val().toLowerCase(),
          'zip':zipIn.val(),
          'date':dateIn.val(),
          'time':timeIn.val()
        };
    console.log(data);
    socket.emit('registration',data);
    console.log('Registration Submitted');      
  });
  //Server confirmation that database registration took place
  socket.on('registration-confirmation', function(rows) {
    console.log("Registration Recieved!");
    conf.css('display','block');
  });

  //When Police Address Form submission is clicked:
  // p for police
  var pAddress = $(document.getElementById('paddress')),
      pAddress2 = $(document.getElementById('paddress2')),
      pCity = $(document.getElementById('pcity')),
      pState = $(document.getElementById('pstate')),
      pZip = $(document.getElementById('pzipcode')),
    
      pSubmit = $(document.getElementById('psubmit')),

      returnName = $(document.getElementById('returnName')),
      returnAddress = $(document.getElementById('returnAddress'));

  pSubmit.on('click', function() {
    console.log("Police Submit Button Clicked!");
    var data = {
          'address':pAddress.val().toLowerCase(),
          'address2':pAddress2.val().toLowerCase(),
          'city':pCity.val().toLowerCase(),
          'state':pState.val().toLowerCase(),
          'zip':pZip.val()
        };
    console.log(data);
    socket.emit('police-query', data);
    console.log("Police Query Submitted");
  });
  socket.on('police-response', function(data) {
    console.log(data);
    for(int i=0; i<data.length; i++) {
      
    }

  });

//SOCKET INTERACTIONS
  //how client deals with Response Data
  //informer for server-side / sql errors
  socket.on('info', function(err) {
    console.log(err);
  });

});

