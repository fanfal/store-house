/*global $ */
function lineAnimation(distance) {
    "use strict";
    $(".tabline").css("transform", 'translate(' + distance + 'px)');
    $(".tabline").css("transition", 'all 0.5s ease-in-out');
    
}
$(document).ready(function () {
    "use strict";
    var windowWidth = $("body").width(),
        clickable = $("#tabclickable"),
        tabItems = $(".tabItem"),
        tabLine = $(".tabLine"),
        dynamicIFrame = $("#dynamic_iframe");
    
    var pageArray = new Array("homepage.html",
                              "projectmanagement.html",
                              "homepage.html",
                              "outgoing.html",
                              "statistics.html");

    tabItems.click(function () {
        $(this).attr("class", "active");
        //mark cur item as actived
        var selectedIndex = -1;
        var clickedItem = $(this);
        var itemCount = tabItems.length;
        tabItems.each(function (index, element) {
            $(this).attr("class", "");
            if (clickedItem.is(element)) {
                selectedIndex = index;
            }
        });
        $(this).attr("class", "active");
        dynamicIFrame.attr("src", "/htmls/contents/" + pageArray[selectedIndex]);
        lineAnimation(windowWidth / itemCount * selectedIndex);
    });

    $("#first").click();

});

 