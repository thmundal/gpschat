function setCookie(c_name,value,exdays,json) {
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    
    if(json)
        value = JSON.stringify(value);
    
    var c_value=escape(value) + ((exdays===null) ? "" : "; expires="+exdate.toUTCString());
    
    document.cookie=c_name + "=" + c_value;
}

function getCookie(c_name, json) {
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");
    if (c_start == -1){
        c_start = c_value.indexOf(c_name + "=");
    }
    if (c_start == -1) {
        c_value = null;
    }
    else {
        c_start = c_value.indexOf("=", c_start) + 1;
        var c_end = c_value.indexOf(";", c_start);
        if (c_end == -1) {
            c_end = c_value.length;
        }
        c_value = unescape(c_value.substring(c_start,c_end));
    }
    
    if(json)
        return JSON.parse(c_value);
    
    return c_value;
}



function r() {
    setCookie("gpschat_user", null, -1, true);
}

function displayLoginDialog(socket) {
    $("<div>").addClass("loginWrapper").attr("id", "login").append(
        $("<form>").attr("action", "javascript:void").append(
            $("<div>").html("Enter nickname").append(
                $("<input>").attr("name", "nickname").attr("id", "usernick")
            )
        ).on("submit", function(event) {
            if(socket)
                socket.emit("function", { func: "login", data: $("#usernick").val()});
                
            return false;
        })
    ).dialog();
}

window.addEventListener("load", function() {
    if(!navigator.geolocation)
        return;
        
    var socket = io.connect(window.location);
    
    var c = document.getElementById("cc");
    var ci = document.getElementById("cio");
    var form = document.getElementById("cif");
    var user_cookie = getCookie("gpschat_user", true);

    socket.on("connection", function(data) {
        if(user_cookie === null) {
            displayLoginDialog(socket);
        } else {
            // We have a cookie from earlier
            socket.emit("function", { func: "login", data: user_cookie.username, id: user_cookie.id});
        }
        c.innerHTML = data.message;
    });
    
    socket.on("message", function(data) {
        c.innerHTML += "<br />" + data.message;
    });
    
    socket.on("private_message", function(data) {
        c.innerHTML += "<br />Private message from " + data.sender + ": " + data.message;
    });

    socket.on("function", function(data) {
        switch(data.func) {
            case "login":
                switch(data.state) {
                    case "accepted":
                        $("#login").dialog("close");
                        setCookie("gpschat_user", data.user, 30, true);
                        break;
                    case "failed":
                        //r();
                        displayLoginDialog(socket);
                        break;
                }
                break;
            case "userlist":
                $("#cl").html("");
                var userlist = data.data;
                for(var i in userlist) {
                    var username = userlist[i].username;
                    $("#cl").append($("<div>").html(username));
                }
            break;
        }
    });

    function sendChatMessage(event) {
        var data = ci.value;
        
        if(ci.value[0] == "/") {
            var split = data.split(" ");
            var f = split[0].substring(1, split[0].length);
            var message = split.splice(1).join(" ");
            socket.emit("function", { func: f, data: message});
        } else
            socket.emit("message", {message: ci.value });
            
        ci.value = "";
    }
    
    form.addEventListener("submit", sendChatMessage);
    
    // Geolocation determination
    navigator.geolocation.getCurrentPosition(function(position) {
        console.log(position);
        
        // var lookup = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.coords.latitude + ","+ position.coords.longitude +"&sensor=true";
        socket.emit("geolocation", { type: "register", data: position });
    });
});