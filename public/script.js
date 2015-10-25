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
  //Global Vars
  var delivery_manifest;
  //FIELDS:
  var firstName = $(document.getElementById('first_name')),
      lastName = $(document.getElementById('last_name')),
      student = $(document.getElementById('student_id')),
      phone = $(document.getElementById('phone_number')),
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

  //BEGIN Police Page Interactions
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
  socket.on('police-response', function(data) { // { first_name:"sally", phone:6}
    console.log(data);
    data = data.rows;
    var table = $(document.createElement('table')),
        tblBody=$(document.createElement('tbody'));
    for(var r=-1;r<data.length;r++) {
      var row = document.createElement('tr');
      for(var c=0;c<2;c++) {
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
        }
        cell.appendChild(cellText);
        row.appendChild(cell);
      }
      tblBody.append(row);
    }
    table.append(tblBody);
    $(document.getElementById('returnTable')).append(table);

  });
  //End Police Page Interactions

  //Complaint Form Interactions BEGIN
    //c for complaint form
  var cAddress = $(document.getElementById('yaddress')),
      cAddress2 = $(document.getElementById('yaddress2')),
      cCity = $(document.getElementById('ycity')),
      cState = $(document.getElementById('ystate')),
      cZip = $(document.getElementById('yzipcode')),

      partyAdd = $(document.getElementById('partyaddress')),
      partyAdd2 = $(document.getElementById('partyaddress2')),
      partyCity = $(document.getElementById('partycity')),
      partyState = $(document.getElementById('partystate')),
      partyZip = $(document.getElementById('partyzipcode')),

      cSubmit = $(document.getElementById('ysubmit'));
  
  cSubmit.on('click', function() {
    var cAdd = 
          cAddress.val() +", "+
          cAddress2.val() +", "+
          cCity.val() +", "+
          cState.val() +", "+
          cZip.val(),
        pAdd =
          partyAdd.val() +", "+
          partyAdd2.val() +", "+
          partyCity.val() +", "+
          partyState.val() +", "+
          partyZip.val(),
        distance;
    console.log(cAdd + pAdd);
    if(cAdd !=", , , , " && pAdd!=", , , , ") {
      getCoordinates(cAdd, function(cCoordinates) { 
        getCoordinates(pAdd, function(pCoordinates) { 
          distance = getDistanceMiles(
            cCoordinates[0],
            cCoordinates[1],
            pCoordinates[0],
            pCoordinates[1]
          ); 
          if(distance <= .25) { 
            data = {
              'address':partyAdd.val().toLowerCase(),
              'address2':partyAdd2.val().toLowerCase(),
              'city':partyCity.val().toLowerCase(),
              'state':partyState.val().toLowerCase(),
              'zip':partyZip.val()
            };
            socket.emit('text-info-query',data);
          }
        });
      });
    } else if(pAdd!=", , , , " && navigator.geolocation) {
      //u for user
      var uLat, uLng;
      navigator.geolocation.getCurrentPosition(function(position) {
        uLat = position.coords.latitude;
        uLng = position.coords.longitude;

        getCoordinates(pAdd, function(pCoords) {
          distance = getDistanceMiles(
            uLat,
            uLong,
            pCoords[0],
            pCoords[1] 
          );
          if(distance <= .25) {
            data = {
              'address':partyAdd.val().toLowerCase(),
              'address2':partyAdd2.val().toLowerCase(),
              'city':partyCity.val().toLowerCase(),
              'state':partyState.val().toLowerCase(),
              'zip':partyZip.val()
            };
            socket.emit('text-info-query',data);
          }
        });
      });
    } else {
      $('.error').css('display','block'); 
    }
  });

  //Distance Calculations and Location:
  var geocoder = new google.maps.Geocoder();

  function getCoordinates( address, callback) {
    var coordinates;
    geocoder.geocode({ 'address': address}, function (results, status) {
      var coords_obj = results[0].geometry.viewport;
      console.log("1: "  + coords_obj);
      console.log("test: " + coords_obj.j.j);
      coordinates = [coords_obj.O.O, coords_obj.j.j];
        callback(coordinates);
    });
  }
  function getDistanceMiles(lat1,lon1,lat2,lon2) {
    var R = 0.621371 * 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; //* 0.621371; // Distance in miles
    return d;
  }
  function deg2rad(deg) {
    return deg * (Math.PI/180);
  }
//Delivery List Page
var display = $(document.getElementById('displayButton')),
    tableDiv = $(document.getElementById('tableDiv')),
    edit = $(document.getElementById('editButton'));

display.on('click', function() {
  socket.emit('delivery-query');
});
edit.on('click', function() {

});
socket.on('delivery-report', function(data) {
    delivery_manifest = data

    var table = $(document.createElement('table')),
        tblBody=$(document.createElement('tbody'));
    for(var r=-1;r<data.length;r++) {
      var row = document.createElement('tr');
      for(var c=0;c<7;c++) {
        var cell = document.createElement('td'),
            cellText;
        switch (c) {
          case 0:
            if(r<0)  cellText = document.createTextNode("Name");
            else cellText = document.createTextNode(data[r].first_name+" ");
            break;
          case 1:
            cellText = document.createTextNode(data[r].last_name);
            break;
          case 2:
            if(r<0)  cellText = document.createTextNode("Phone Number");
            else cellText = document.createTextNode(data[r].phone);
            break;
          case 3:
            if(r<0)  cellText = document.createTextNode("Address");
            else cellText = document.createTextNode(data[r].address +", "+
                data[r].address2 +", "+
                data[r].city +", "+
                data[r].state +", "+
                data[r].zipcode
              );
            break;
          case 4:
            if(r<0)  cellText = document.createTextNode("Date");
            else cellText = document.createTextNode(data[r].date);
            break;
          case 5:
            if(r<0)  cellText = document.createTextNode("Time");
            else cellText = document.createTextNode(data[r].time);
            break;
          case 6:
            if(r<0)  cellText = document.createTextNode("Status");
            else {
              cellText = document.createElement('input');
              if(data[r].delivery_status>0) cellText.addAttribute("checked disabled");
              else cellText.addClass("unchecked");
            }
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

