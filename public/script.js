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
  var firstName = $(document.getElementById('first_name')),
      lastName = $(document.getElementById('last_name')),
      student = $(document.getElementById('student_id')),
      phone = $(document.getElementById('phone_number')),
      phone2 = $(document.getElementById('phone_number2')),
      provider = $(document.getElementById('provider_options')),
      address = $(document.getElementById('address')),
      address2 = $(document.getElementById('address2')),
      city = $(document.getElementById('city')),
      state = $(document.getElementById('state')),
      zip = $(document.getElementById('zipcode')),
      date = $(document.getElementById('date')),
      time = $(document.getElementById('time')),

      submitButton = $(document.getElementById('submit')),
      
      conf = $(document.getElementById('conf')); //registration confirmation

  //When Registration Submit Button is Clicked:
  submitButton.on('click', function() {  
    console.log('Submit Button Clicked');
    var data = { 
          'first_name':firstName.val().toLowerCase(),
          'last_name':lastName.val().toLowerCase(),
          'student_id':student.val().toLowerCase(),
          'phone':phone.val().toLowerCase(),
          'phone2':phone2.val().toLowerCase(),
          'provider':provider.val().toLowerCase(),
          'address':address.val().toLowerCase(),
          'address2':address2.val().toLowerCase(),
          'city':city.val().toLowerCase(),
          'state':state.val().toLowerCase(),
          'zip':zip.val(),
          'date':date.val(),
          'time':time.val()
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
    
      pSubmit = $(document.getElementById('psubmit'));

  pSubmit.on('click', function() {
    var div = $(document.getElementById('returnTable'));
    div.children().remove();
    console.log("Police Submit Button Clicked!");
    var data = {
          'address':pAddress.val().toLowerCase(),
          'address2':pAddress2.val().toLowerCase(),
          'city':pCity.val().toLowerCase(),
          'state':pState.val().toLowerCase(),
          'zip':pZip.val()
        };
    console.log("Police Query Submitted");
    console.log(data);
    socket.emit('police-query', data);
    console.log("Police Query Submitted");
  });
  socket.on('police-response', function(data) { // { first_name:"sally", phone:6, phone2:2345 }
    console.log(data);
    data = data.rows;
    var table = $(document.createElement('table')),
        tblBody=$(document.createElement('tbody'));
    for(var r=-1;r<data.length;r++) {
      var row = document.createElement('tr');
      for(var c=0;c<3;c++) {
        var cell = document.createElement('td'),
            cellText;
        switch (c) {
          case 0: 
            if(r<0)  cellText = document.createTextNode("First Name");
            else cellText = document.createTextNode(data[r].first_name);
            break;
          case 1:
            if(r<0)  cellText = document.createTextNode("Phone Number");
            else cellText = document.createTextNode(data[r].phone);
            break;
          case 2:
            if(r<0)  cellText = document.createTextNode("Additional Phone");
            else cellText = document.createTextNode(data[r].phone2);
            break;
        }
        cell.appendChild(cellText);
        row.appendChild(cell);
      }
      tblBody.append(row);
    }
    table.append(tblBody);
    $(document.getElementById('returnTable')).append(table);

  });

//SOCKET INTERACTIONS
  //how client deals with Response Data
  //informer for server-side / sql errors
  socket.on('info', function(err) {
    console.log(err);
  });

});

