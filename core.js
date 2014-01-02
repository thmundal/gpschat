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
                    user.startReceiving();
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
                    
                    user.sendPrivateMessage(message, username);
                } else {
                    console.log("user not found?");
                    console.log(user);
                }
                break;
            case 'nick':
                if(user)
                    user.changeUsername(data.data);
                break;
        }
    });
    
});