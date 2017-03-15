/*global $ */
$(document).ready(function () {
    "use strict";
    var navLis = $(".nav-li");
    var curIndex = -1;
    var pages = new Array("createProject.html", "projectDetails.html");
    navLis.mouseleave(function () {
        $(this).removeClass("hovered-li");
        $(this).css("cursor", "default");
    });
    
    navLis.mouseenter(function () {
        $(this).addClass("hovered-li");
        $(this).css("cursor", "pointer");
    }); 
    
    navLis.click (function () {
        navLis.removeClass("selected-li");
        $(this).addClass("selected-li");
        var index = Number($(this).attr("value"));
        if (curIndex != index){
                curIndex = index;
                $("#dynamic-frame").attr("src", "./subframes/" + pages[index - 1]);
                $("usage").attr("title", "1");      //表明正在查看
            }
    });
    
    $("#nav-create-li").click();
});

function setUsage(usage){
    $("#usage").attr("title", usage);
}

function getUsage(){
    var res = $("#usage").attr("title");
    return res;
}
