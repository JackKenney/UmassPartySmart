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
  var eMessage = document.getElementById('errorMessage');
  var tableDiv = document.getElementById('mysql-table');

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

  //whatever happens when the post button is clicked
  $('.postButton').on('click', function() {
    var uInput = $('#userInput').val();
    var pInput = $('#postInput').val();
    uInput = checkString(uInput);
    pInput = checkString(pInput);
    var sql = 'INSERT INTO posts (user,post_text) VALUES(\"'+uInput+'\",\"'+pInput+'\");'; 

    //if no information was entered, don't send the query + show error message
    if(uInput==="Username" || pInput==="Post Text") { 
      sql = "";
      console.log('No post data entered');
      //eMessage.addClass('showMe');
    }
    console.log(sql);
    socket.emit('new-postData', { 'sql' : sql }); //commented out to test removal of "" in sql string for sub.
    console.log('Post Button Clicked!');
    document.getElementById('userInput').value = "Username";
    document.getElementById('postInput').value = "Post Text";

    //for dev purposes, regardless of sql string: rebuild table with current table data
    sendQuery();
  });
  //function applied to a field that is going to be sent do sql to prevent errors in database writing
  var checkString = function (string) {
    var strTmp = string, len = string.length; 
    for(var i=0; i<len; i++) {
      if(strTmp.charAt(i)=='\"' || strTmp.charAt(i)=='\'' || strTmp.charAt(i)=='\\') {
        strTmp = strTmp.substring(0,i) + '\\' + strTmp.substring(i);
        //i--; //may not need this
        len++;
        i++;
      }
    }
    return strTmp;
  }
  //function that builds table + populates with fetched data
  var buildTable = function(data) {

    var tbl = document.createElement('table');
    var tblBody = document.createElement('tbody');
    for(var j=0; j<data.length; j++) {
      var row = document.createElement('tr');
      for(var i=0; i<2; i++) {
        var cell = document.createElement('td');
        var cellText;
          if(i===0) { cellText = document.createTextNode(data[j].user) }
          if(i===1) { cellText = document.createTextNode(data[j].post_text) }

        cell.appendChild(cellText);
        row.appendChild(cell);
      }
      tblBody.appendChild(row);
    }
    tbl.appendChild(tblBody);
    tbl.setAttribute("id","myTbl");
    tbl.setAttribute("border","1");

    tableDiv.appendChild(tbl);
    tableShown = true;

    console.log("Table Built and Added to Div");
  }
  //function for making query to database asking for table data from posts
  //this leads to a displaying of the table on the html page in the query-response socket function
  var sendQuery = function() {
    noDupTable();
    socket.emit('query-postData', { 'sql' : 'SELECT * FROM posts'} );
    console.log('Query Sent!');
  }
  var noDupTable = function() {
    var myTable = document.getElementById('myTbl');
    if(tableShown) {
      console.log("Duplicate table removed");
      tableDiv.removeChild(myTable);
    }
  }
});

