$(document).ready(function () {
    $("#login").click(function () {
       var username = $("#username").val();
       var password = $("#password").val();
       alert(username + password);
    });
});