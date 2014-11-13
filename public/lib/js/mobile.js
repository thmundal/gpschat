function resizeViewport() {
    var ori = window.orientation,
        fontsize = (ori==90 || ori==-90) ? "8px" : "10px";
        
    $("body").css("height", window.innerHeight+"px");
    $("body").css("font-size", fontsize);
}

$(function() {
    resizeViewport();
    
    $("#menu").on("click", function(e) {
        
    });
});

window.addEventListener("orientationchange", function(event) {
    resizeViewport();
});