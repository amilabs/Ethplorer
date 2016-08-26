/*!
 * Copyright 2016 Everex https://everex.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// npm install connect serve-static

var http = require('http');
var fs = require('fs');
var serveStatic = require('serve-static');
var serve = serveStatic(__dirname);

var server = http.createServer(function(req, res) {
    if((0 === req.url.indexOf('/js/')) || (0 === req.url.indexOf('/css/')) || (0 === req.url.indexOf('/img/')) || (0 === req.url.indexOf('/cfg/'))){
        serve(req, res, function(){});
    }else{
        fs.readFile(__dirname + '/index.html', function(error, content) {
            res.writeHead(200, { 'Content-Type': 'text/html'});
            res.end(content, 'utf-8');
        });        
    }
});

server.listen(8001);


