var fs = require("fs");
var User = require("./user.js");

var docroot = "./public";

// ******** WEB SERVER ***********
var app = require("http").createServer(function(req, res) {
    var url = req.url;
    
    if(url === "/")
        url = "index.html";
        
    // Check if file exists
    fs.readFile(docroot + "/" + url, function(err, data) {
        if(err)
            res.end("404");
        else
            res.end(data);
    });
}).listen(8081);
// *********** WEB SERVER END *************

// Users "database"

function getDistance(user1, user2) {
    if(user1.position === null || user2.position === null)
        return false;
        
    var lat1 = user1.position.coords.latitude;
    var lat2 = user1.position.coords.longitude;
    var lon1 = user2.position.coords.latitude;
    var lon2 = user2.position.coords.longitude;
    
    var R = 6371; // km
    var dLat = (lat2-lat1).toRad();
    var dLon = (lon2-lon1).toRad();
    lat1 = lat1.toRad();
    lat2 = lat2.toRad();
    
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    
    return d;
}

function startReceiving(socket, user) {
    socket.emit("function", { func: "login", state: "accepted", user: { id: user.id, username: user.username } });
    socket.broadcast.emit("message", { message: user.username + " has returned to the chat!" });
    
    socket.on("message", function(data) {
        socket.broadcast.emit("message", { message: user.username + ": " + data.message });
        socket.emit("message", { message: user.username + ": " + data.message });
    });
    
    socket.on("privatemessage", function(data) {
        var user = User.findUser(data.username);
        if(user) {
            user.sendPrivateMessage(data.message);
        }
    });
}

var io = require("socket.io").listen(app);

io.sockets.on("connection", function(socket) {
    var user = null;
    
    socket.emit("connection", { message: "Connection accepted"});
    
    socket.on("function", function(data) {
        switch(data.func) {
            case 'login':
                if(!data.data || data.data === null || data.data === "")
                    break;
                    
                user = new User(data.data);
                if(user.login(socket, data.id)) {
                    startReceiving(socket, user);
                } else {
                    socket.emit("function", { func: "login", state: "failed" });
                    console.error("Cannot login");
                }
                break;
            
            case 'private':
                if(user) {
                    var split = data.data.split(" ");
                    var username = split[0];
                    
                    var t = split.splice(1, split.length);
                    var message = t.join(" ");
                    
                    console.log(message);
                    user.sendPrivateMessage(message, username);
                } else {
                    console.log("user not found?");
                    console.log(user);
                }
                break;
        }
    });
    
});