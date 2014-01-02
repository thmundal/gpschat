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
        return true;
    } else if(findUser && uid == findUser.id) {
        return true;
    }
    
    return false;
};

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

module.exports = User;