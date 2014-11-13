var chdir = "e:/node_projects/gpschat";

var fs = require("fs");
var mobile = require(chdir+"/node_modules/mobile-detect/mobile-detect.js");
var http = require("http");

var User = require(chdir+"/user.js");
var geo = require(chdir+"/geolookup.js");
var server = require(chdir+"/server.js");

var sock_func = require(chdir+"/sock_func.js");

var docroot = "e:/node_projects/gpschat/public";

// ******** WEB SERVER ***********
var app = http.createServer(function(req, res) {
    server.serve(req, res);
}).listen(8081);
// *********** WEB SERVER END *************

var io = require("socket.io").listen(app);

io.sockets.on("connection", function(socket) {
    var user = null;
    sock_func.socket = socket;
    
    socket.emit("connection", { message: "Connection accepted"});
    
    socket.on("function", function(data) {
        sock_func.call_function.call(this, data);
    });
    
    socket.on("geolocation", function(data) {
        sock_func.geolocation.call(this, data);
    });
});