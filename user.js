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
    user.socket.broadcast.emit("message", { message: user.username + " has returned to the chat!" });
    
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
}

User.prototype.logout = function() {
    if(users.indexOf(this) > 0)
        users.splice(users.indexOf(this), 1);
};

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
    
    if(r && r.socket)
        return r.socket.emit("private_message", { "message": message, "sender" : this.username});
        
    return false;
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