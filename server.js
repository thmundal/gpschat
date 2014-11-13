var mobile = require("mobile-detect");

var server = function() {

};

server.serve = function(req, res) {
    var url = req.url;
    var mobileDetect = (new mobile(req.headers['user-agent']));
    var m_override = false;
    
    console.log("*********** MOBILE DETECT: " + mobileDetect.mobile());
    if(url === "/m") {
        m_override = true;
        url = "/";
    }
    
    if(url === "/")
        url = "index.html";
    
    if(mobileDetect.mobile() !== null || m_override)
        url = "m/"+url;
    
    // Check if file exists
    fs.readFile(docroot + "/" + url, function(err, data) {
        if(err)
            res.end("404");
        else
            res.end(data);
    });
};

module.exports = server;