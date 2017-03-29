const PROJECT_EMPTY_ALERT_MESSAGE = "您好,请选择出库项目!";
const PRODUCT_NOT_EXIST_OR_OUT_OF_STORE_MESSAGE = "你所扫描的产品不在所选项目中, 或者已经出库!";
const NO_ITEMS_MESSAGE = "您还没有扫描数据!";
const ALERT_TIME = 2000;
const STR_OPERATING = "正在出库";
const STR_OPERABLE = "可以出库";


var app = angular.module('myApp', []);
var projectInfo = [];

function showProjectEmptyAlert() {
    $("#alert_text").text(PROJECT_EMPTY_ALERT_MESSAGE);
    $("#alert").show();
    playBeepAudio()
    hideAlert();

}
function showProductNotExistOrOutOfStoreAlert() {
    $("#alert_text").text(PRODUCT_NOT_EXIST_OR_OUT_OF_STORE_MESSAGE);
    $("#alert").show();
    playBeepAudio()
    hideAlert();
}

function playBeepAudio() {
    document.getElementById("beep").play();
}

function showNoItemAlert() {
    $("#model_alert_text").text(NO_ITEMS_MESSAGE);
    $("#model_alert").show();
    playBeepAudio()
    $("#model_alert").fadeOut(ALERT_TIME);
}

function hideAlert() {
    $("#alert").fadeOut(ALERT_TIME);
}

$("#close").click(function () {
    $("#alert").fadeOut();
});

$("#btn_print_list").click(function () {
    if (projectInfo.length === 0) {
        showNoItemAlert();
    } else {
        window.print();
    }

});

var pageReady = false;
$(document).ready(function () {
    pageReady = true;
});

app.controller('myCtrl', function ($scope, $http) {
    $scope.init = function () {
        $scope.productCount = {};
        $scope.productCount.frameNum = 0;
        $scope.productCount.fanNum = 0;
        $scope.productCount.glassNum = 0;
        $scope.productCount.otherNum = 0;
    }

    $scope.projectCluster = {
        operable: [],
        operating: []
    }

    function clearCluster(){
        $scope.projectCluster.operable = [];
        $scope.projectCluster.operating = [];
    }

    function enableSelector(bEnable) {
        if(bEnable){
            $("#project_type_select").attr("disabled", false);
            $("#select_project").attr("disabled", false);
        }
        else{
            $("#project_type_select").attr("disabled", true);
            $("#select_project").attr("disabled", true);
        }

    }

    var designatedProjType = projectType.OPERATING;
    var designatedProjName = "";

    var projTypeArray = [STR_OPERATING, STR_OPERABLE];
    $scope.select_name = "";
    $scope.projType = projTypeArray;

    $scope.projTypeChanged = function () {
        value = $scope.select_type;
        var type = (value == projTypeArray[0]) ? projectType.OPERATING : projectType.OPERABLE;
        designatedProjType = type;
        if (type == projectType.OPERABLE) {
            $scope.names = $scope.projectCluster.operable;
        }
        else if (type == projectType.OPERATING) {
            $scope.names = $scope.projectCluster.operating;
        }
        if($scope.names.length > 0) {
             if(designatedProjName == ""){
                designatedProjName = $scope.names[0];
             }
             $scope.select_name = designatedProjName;
        }
        else{
            $scope.select_name = "";
        }
    }

    function requestProjectList () {
    //修改成同步的，异步请求下，状态需要延时同步，太麻烦了
        $.ajax({
            type: "GET",
            url: "http://localhost:8080/get-data/projects",
            dataType: 'json',
            async:false,
            success: successCallback,
            error: errorCallback
        });

        function successCallback(response) {
            clearCluster();
            var data = response.project_list;
            for (var i = 0; i < data.length; i++) {
                if (data[i].operation_status == projectType.OPERABLE) {
                    $scope.projectCluster.operable.push(data[i].project_name);
                }
                else if (data[i].operation_status == projectType.OPERATING) {
                    $scope.projectCluster.operating.push(data[i].project_name);
                }
            }
            if(designatedProjType == projectType.OPERATING){
                $scope.select_type = STR_OPERATING;
            }
            else{
                $scope.select_type = STR_OPERABLE;
            }
            $scope.projTypeChanged();
            if(pageReady){
                $scope.$apply();
            }
        }

        function errorCallback(error) {
            //error code
        }
    }

    requestProjectList();
    $scope.ScanKeyDown = function (e) {
        var projectName = $scope.select_name;
        if (e.key == "Enter") {
            var projectId = $scope.scan_text;
            $http.get("http://localhost:8080/out-going?name=" + projectName + "&productId=" + projectId)
                .then(scanSuccessCallback, scanErrorCallBack);
        }
    }

    function scanSuccessCallback(response) {
        var data = response.data.project_info_list;
        if (data.length == 0) {
            showProductNotExistOrOutOfStoreAlert();
        } else {
            countProductType(data);
            projectInfo = data.concat(projectInfo);
            $scope.items = projectInfo;
        }
        $scope.scan_text = "";
    }

    function scanErrorCallBack(error) {

    }

    $("#btn_start_scan").click(function () {
        if ($scope.select_name == "") {
            showProjectEmptyAlert();
            $scope.scan_text = "";
            return;
        }
        $(this).addClass("disabled");
        $("#btn_stop_scan").removeClass("disabled");
        $("#scan_input").focus();
        $("#scan_input").blur(function () {
            $(this).focus();
        });
        updateProjectStatus($scope.select_name, projectType.OPERATING);

        designatedProjType = projectType.OPERATING;
        designatedProjName = $scope.select_name;
        requestProjectList();
        designatedProjName = "";
        enableSelector(false);

    });

    $("#btn_generate_list").click(function () {
        updateProjectStatus($scope.select_name, projectType.OPERABLE);
        if ($("#btn_start_scan").hasClass("disabled")) {
            $("#btn_start_scan").removeClass("disabled");
            $("#btn_stop_scan").addClass("disabled");
        }
        $("#scan_input").off("blur");
        $("#scan_input").blur();
        $('#myModal').modal('show');
    })

    $("#btn_stop_scan").click(function () {
        updateProjectStatus($scope.select_name, projectType.OPERABLE);
        $("#btn_start_scan").removeClass("disabled");
        $(this).addClass("disabled");
        $("#scan_input").off("blur");
        $("#scan_input").blur();

        enableSelector(true);
        designatedProjType = projectType.OPERABLE;
        designatedProjName = $scope.select_name;
        requestProjectList();
        designatedProjName = "";
    })


    function countProductType(data) {
        switch (data[0].type) {
            case type.FRAME:
                $scope.productCount.frameNum++;
                break;
            case type.FAN:
                $scope.productCount.fanNum++;
                break;
            case type.GLASS:
                $scope.productCount.glassNum++;
                break;
            case type.OTHER:
                $scope.productCount.otherNum++;
                break;
        }
    }

    function updateProjectStatus(projectName, status) {
        $.ajax({
            type: "POST",
            url: "http://localhost:8080/status",
            data: {"project_name": projectName, status: status},
            dataType: 'json',
            async:false,
            success: function (data) {
            },
            error: function (e) {
            }
        })
    }
});

