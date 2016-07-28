// npm install connect serve-static

var http = require('http');
var fs = require('fs');
var serveStatic = require('serve-static');
var serve = serveStatic(__dirname);

var server = http.createServer(function(req, res) {
    if((0 === req.url.indexOf('/js/')) || (0 === req.url.indexOf('/css/')) || (0 === req.url.indexOf('/cfg/'))){
        serve(req, res, function(){});
    }else{
        fs.readFile(__dirname + '/index.html', function(error, content) {
            res.writeHead(200, { 'Content-Type': 'text/html'});
            res.end(content, 'utf-8');
        });        
    }
});

server.listen(8001);


