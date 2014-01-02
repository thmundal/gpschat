var uuid = require("node-uuid");

var users = [];

var User = function(username) {
    this.username = username;
    this.socket = null;
    this.position = null;
};

User.prototype.login = function(socket, uid) {
    this.socket = socket;
    
    var findUser = User.findUser(this.username);
    
    if(users.indexOf(this) < 0 && !findUser) {
        this.id = uuid.v1();
        users.push(this);
        return this;
    } else if(findUser && uid == findUser.id) {
        this.id = findUser.id;
        return this;
    }
    
    return null;
};

User.prototype.startReceiving = function() {
    var user = this;

    user.socket.emit("function", { func: "login", state: "accepted", user: { id: user.id, username: user.username } });
    user.socket.emit("message", { message: "Welcome to the GPSChat, " + user.username });
    user.socket.broadcast.emit("message", { message: user.username + " entered the chat!" });
    
    this.sendClientList();
    
    user.socket.on("message", function(data) {
        user.socket.broadcast.emit("message", { message: user.username + ": " + data.message });
        user.socket.emit("message", { message: user.username + ": " + data.message });
    });
    
    user.socket.on("privatemessage", function(data) {
        var user = User.findUser(data.username);
        if(user) {
            user.sendPrivateMessage(data.message);
        }
    });
    
    user.socket.on("disconnect", function(data) {
        user.logout();
    });
}

User.prototype.logout = function() {
    var user = this;
    this.socket.broadcast.emit("message", { message: user.username + " has left the chat." });
    if(users.indexOf(this) > 0)
        users.splice(users.indexOf(this), 1);
};

User.prototype.changeUsername = function(new_username) {
    var old_username = this.username;
    var userid = this.id;
    this.username = new_username;
    this.socket.broadcast.emit("message", { message: old_username + " is now known as " + new_username });
    this.socket.emit("function", { func: "change_username", new_user: { username: new_username, id: userid }});
    this.sendClientList();
}

// What is the point of this function?
User.prototype.sendMessage = function(message) {
    if(this.socket !== null)
        this.socket.emit("message",{ "message" : message });
};

User.prototype.sendPrivateMessage = function(message, receiver) {
    var r = User.findUser(receiver);
    if(!r)
        return console.error("Cannot find user " + receiver);
        
    if(!r.socket) {
        console.error("Cannot find user's socket");
        console.log(r);
        return false;
    }
    
    return r.socket.emit("private_message", { "message": message, "sender" : this.username});
};

User.findUser = function(username) {
    for(var i in users) {
        if(users[i].username == username)
            return users[i];
    }
    return false;
}

User.findUserById = function(id) {
    for(var i in users) {
        if(users[i].id == id)
            return users[i];
    }
    return false;
}

User.prototype.sendClientList = function() {
    var usersToSend = [];
    for(var i in users) {
        usersToSend[i] = { username: users[i].username };
    }

    this.socket.emit("function", {func: "userlist", data: usersToSend});
    this.socket.broadcast.emit("function", {func: "userlist", data: usersToSend});
}

User.prototype.getDistance = function(user2) {
    user1 = this;
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

module.exports = User;