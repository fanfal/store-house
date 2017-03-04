/*global $ */
$(document).ready(function () {
    "use strict";
    var navLis = $(".nav-li");
    var curIndex = -1;
    var pages = new Array("createproject.html", "projectinformationcards.html");
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

function switchToProjactItemPage (name) {
    $("#proj-name").attr("title", name);
    //切换页面
    $("#dynamic-frame").attr("src", "./subframes/projectitemstatus.html");
}

function getProjectInfoName(){
    return $("#proj-name").attr("title");
}

function setUsage(usage){
    $("#usage").attr("title", usage);
}

function getUsage(){
    $("#usage").attr("title");
}

function gotoProjectCards() {
    $("#nav-check-li").click();
}