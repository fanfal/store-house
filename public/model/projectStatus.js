/*global $*/
var c_projectInfoURL = "http://localhost:8080/get-data/project";
var projectType = {
    OPERABLE  : 0,       //可以出库
    OPERATING : 1,       //正在出库
    EXHAUSTED : 2,        //出库完成
    ALL       : 3        //全部工程
}

function getProjectState (projectName) {
    var res = -1;
    $.ajax({
            url: c_projectInfoURL+"?name="+projectName,
            type: "get",
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            async: false,
            success: function (data) {
                res = data.operation_status;
            },
            error: function (data) {

            }
        })
    return res;
}