var app = angular.module('myApp', []);
var projectInfo = [];
const PROJECT_EMPTY_ALERT_MESSAGE = "项目不能为空!";
const PRODUCT_NOT_EXIST_OR_OUT_OF_STORE_MESSAGE = "产品不在所选项目中,或者已经出库!";


function showProjectEmptyAlert() {
    $("#alert_text").text(PROJECT_EMPTY_ALERT_MESSAGE);
    $("#alert").show();
}
function showProductNotExistOrOutOfStoreAlert() {
    $("#alert_text").text(PRODUCT_NOT_EXIST_OR_OUT_OF_STORE_MESSAGE);
    $("#alert").show();
}

function showProductOutOfStoreAlert() {
    $("#alert_text").text(PROJECT_IS_ALREADY_OUT_GOING);
    $("#alert").show();
}

function hideAlert() {
    $("#alert").hide();
}

$("#close").click(function () {
    $("#alert").hide();
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
                return;
            } else {
                hideAlert()
            }

            var projectId = $scope.scan_text;
            $http.get("http://localhost:8080/outGoing?name=" + projectName + "&productId=" + projectId)
                .then(successCallback, errorCallback);

            function successCallback(response) {
                var data = response.data.project_info_list;
                if (data.length == 0) {
                    showProductNotExistOrOutOfStoreAlert();
                } else {
                    projectInfo = data.concat(projectInfo);
                    $scope.items = projectInfo;
                }

            }
        }
    }

});


