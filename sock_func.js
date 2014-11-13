var sock_func = function() {
	this.socket = null;
};


sock_func.call_function = function(data) {
    switch(data.func) {
        case 'login':
            if(!data.data || data.data === null || data.data === "")
                break;
                
            user = new User(data.data);
            if(user.login(sock_func.socket, data.id)) {
                user.startReceiving();
            } else {
                sock_func.socket.emit("function", { func: "login", state: "failed" });
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
};

sock_func.geolocation =  function(data) {
    var g = new geo(data.data.coords.latitude, data.data.coords.longitude);
    
    if(typeof(user) !== "undefined") {
        g.on("locationLookup", function(location) { // -> This triggers for every user logged on
            //console.log(location.results[0].formatted_address);
            user.location = location.results[0];
            user.position = { lat: data.data.coords.latitude,
                              lon: data.data.coords.longitude };
            console.log(user);
            user.html("location", location.results[0].formatted_address);
        });
    }
};






module.exports = sock_func;