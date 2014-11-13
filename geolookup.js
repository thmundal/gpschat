var request = require("request");

var geo = function(lat, lon) {
    this.lat = lat;
    this.lon = lon;
    
    var lookup = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + this.lat + ","+ this.lon +"&sensor=true";
    
    var t = this;
    request(lookup, function(error, response, body) {
        if(!error && response.statusCode == 200) {
            location = JSON.parse(body);
            t.callEvent("locationLookup", location);
        } else
            console.log("error getting geolocation adress");
    });
}

geo.prototype.callEvent = function(event, args) {
    for(var i in this.events[event]) {
        this.events[event][i](args);
    }
}

geo.prototype.events = {
    locationLookup : []
}

geo.prototype.on = function(event, callback) {
    this.events[event].push(callback);
}

module.exports = geo;