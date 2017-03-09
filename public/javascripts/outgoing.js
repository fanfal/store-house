const PROJECT_EMPTY_ALERT_MESSAGE = "您好,请选择出库项目!";
const PRODUCT_NOT_EXIST_OR_OUT_OF_STORE_MESSAGE = "你所扫描的产品不在所选项目中, 或者已经出库!";
const ALERT_TIME = 2000;

var app = angular.module('myApp', []);
var projectInfo = [];

function showProjectEmptyAlert() {
    $("#alert_text").text(PROJECT_EMPTY_ALERT_MESSAGE);
    $("#alert").show();
    hideAlert()

}
function showProductNotExistOrOutOfStoreAlert() {
    $("#alert_text").text(PRODUCT_NOT_EXIST_OR_OUT_OF_STORE_MESSAGE);
    $("#alert").show();
    hideAlert()
}


function hideAlert() {
    $("#alert").fadeOut(ALERT_TIME);
}

$("#close").click(function () {
    $("#alert").fadeOut();
})

$("#btn_start_scan").click(function () {
    $(this).addClass("disabled");
    $("#btn_stop_scan").removeClass("disabled");
    $("#scan_input").focus();
    $("#scan_input").blur(function () {
        $(this).focus();
    });

});

$("#btn_stop_scan").click(function () {
    $(this).addClass("disabled");
    $("#btn_start_scan").removeClass("disabled");
    $("#scan_input").unbind("blur");
    $("#scan_input").blur();
})

app.controller('myCtrl', function ($scope, $http) {

    $scope.select_name = "";
    $http.get("http://localhost:8080/getData/projectsName")
        .then(successCallback, errorCallback);

    function successCallback(response) {
        var data = response.data.project_list;
        var array = [];
        for (var i = 0; i < data.length; i++) {
            array.push(data[i].project_name);
        }
        $scope.names = array;
    }

    function errorCallback(error) {
        //error code
    }

    $scope.ScanKeyDown = function (e) {
        var projectName = $scope.select_name;
        if (e.key == "Enter") {
            if (projectName == "") {
                showProjectEmptyAlert();
                $scope.scan_text = "";
                return;
            }
            var projectId = $scope.scan_text;
            $http.get("http://localhost:8080/outGoing?name=" + projectName + "&productId=" + projectId)
                .then(scanSuccessCallback, scanErrorCallBack);
        }
    }

    function scanSuccessCallback(response) {
        var data = response.data.project_info_list;
        if (data.length == 0) {
            showProductNotExistOrOutOfStoreAlert();
        } else {
            projectInfo = data.concat(projectInfo);
            $scope.items = projectInfo;
        }
        $scope.scan_text = "";
    }

    function scanErrorCallBack(error) {

    }

});


