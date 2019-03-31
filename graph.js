var express = require('express')
var app = express()
fs = require('fs');
mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'me',
    password: 'mypassword',
    database: 'tempdb'
})
connection.connect();

function insert_sensor(value) {
  obj = {};
  obj.value = value;
 
  var query = connection.query('insert into sensors set ?', obj, function(err, rows, cols) {
    if (err) throw err;
    console.log("database insertion ok= %j", obj);
  });
}

app.get('/', function(req, res) {
  res.end('Nice to meet you');
});

app.get('/log', function(req, res) {
  r = req.query;
  console.log("GET %j", r);

  insert_sensor(r.value);
  res.end('OK:' + JSON.stringify(req.query));
});

app.get('/graph', function (req, res) {
    console.log('got app.get(graph)');
    var html = fs.readFile('./graph.html', function (err, html) {
    html = " "+ html
    console.log('read file');

    var qstr = 'select * from sensors ';
    connection.query(qstr, function(err, rows, cols) {
      if (err) throw err;

      var n = rows.length;
      var data = "";
      var comma = "";
      var sy = rows[0].time.getFullYear();
      var sM = rows[0].time.getMonth()+1;
      var sd = rows[0].time.getDate();
      var sh = rows[0].time.getHours();
      var sm = rows[0].time.getMinutes();
      var ss = rows[0].time.getSeconds();
      var ey = rows[n-1].time.getFullYear();
      var eM = rows[n-1].time.getMonth()+1;
      var ed = rows[n-1].time.getDate();
      var eh = rows[n-1].time.getHours();
      var em = rows[n-1].time.getMinutes();
      var es = rows[n-1].time.getSeconds();
     // res.write("start time: " + sy + "," + sm + "," + sd + "," + sh + "," + sm + "," + ss);
     // res.write("last time: " + ey + "," + em + "," + ed + "," + eh + "," + em + "," + es);
      for (var i=0; i< rows.length; i++) {
         r = rows[i];
	 //console.log(r.time.getFullYear() + "," + r.time.getMonth() + "," + r.time.getDate() + "," + r.time.getHours() + "," + r.time.getMinutes() + "," + r.time.getSeconds() + "," + r.value);
         data += comma + "[new Date(" + r.time.getFullYear() + "," + r.time.getMonth() + "," + r.time.getDate() + "," + r.time.getHours() + "," + r.time.getMinutes() + "," + r.time.getSeconds() + "),"+ r.value + "]";
         comma = ",";
      }
      var header = "data.addColumn('date', 'Date/Time');"
      header += "data.addColumn('number', 'Temp');"
      html = html.replace("<%HEADER%>", header);
      html = html.replace("<%DATA%>", data);

      res.writeHeader(200, {"Content-Type": "text/html"});
      res.write(html);
      res.write("start time: " + sy + "-" + sM + "-" + sd + " " + sh + ":" + sm + ":" + ss + '<br \>');
      res.write("last time: " + ey + "-" + eM + "-" + ed + " " + eh + ":" + em + ":" + es + '<br \>');
      res.write("my arduino code: " + '<a href="https://github.com/kimgyujin/sensing-temperature/blob/master/graph.ino" target="_blank">' + "https://github.com/kimgyujin/sensing-temperature/blob/master/graph.ino" + '</a>' + '<br \>');
      res.write("my javascript code: " + '<a href="https://github.com/kimgyujin/sensing-temperature/blob/master/graph.js" target="_blank">' +  "https://github.com/kimgyujin/sensing-temperature/blob/master/graph.js" + '</a>' + '<br \>');
      res.end();
    });
  });
})

var server = app.listen(80, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('listening at http://%s:%s', host, port)
});
