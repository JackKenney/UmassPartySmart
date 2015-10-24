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
  //if display button is clicked, fetch table data and build table
  $('.displayButton').on('click', function() {
    console.log('Display Button Clicked');
    sendQuery();
    //eMessage.removeClass('showMe');
  });

  //how client deals with Response Data
  socket.on('query-responseData', function(rows) {
    console.log("Query Response Data Recieved!");
    //here is where sendQuery() leads to building table
    buildTable(rows);
  });
});

