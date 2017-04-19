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


function OutgoingDuplicateRemoval() {
    this.enableOutgoing = true;
    this.operatingProduct = [];

    this.beginOutGoing = function (projectName, productID, removal) {
        this.operatingProduct.push({pn:projectName, pi:productID});
        setTimeout(function () {
            removal.endOutGoing(projectName, productID);
        }, 50);
    }

    this.endOutGoing = function (projectName, productID) {
        for(var i = 0; i < this.operatingProduct.length; ++i) {
           var productSchema = this.operatingProduct[i];
           if(productSchema.pn == projectName
           && productSchema.pi == productID) {
               this.operatingProduct.splice(i, 1);
               break;
           }
        }
    }

    this.hasDuplicatedProduct = function (projectName, productID) {
        var hasDuplicatedProjectName = false;
        for(var i = 0; i < this.operatingProduct.length; ++i) {
            var productSchema = this.operatingProduct[i];
            if(productSchema.pn == projectName
            && productSchema.pi == productID) {
                return true;
            }
        }

        return false;
    }

    this.canDoOutGoing = function (projectName, productID){
        if(projectName == "" || productID == ""){
            return false;
        }
        if(this.hasDuplicatedProduct(projectName, productID)) {
            return false;
        }
        else {
            return true;
        }
    }

}

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

    var projectTypeArray = [STR_OPERATING, STR_OPERABLE];
    $scope.select_name = "";                //选择的工程名
    $scope.projectType = projectTypeArray;  //工程类型列表

    $scope.projectTypeChanged = function () {
        value = $scope.select_type;
        var type = (value == projectTypeArray[0]) ? projectType.OPERATING : projectType.OPERABLE;
        if (type == projectType.OPERABLE) {
            $scope.names = $scope.projectCluster.operable;
        }
        else if (type == projectType.OPERATING) {
            $scope.names = $scope.projectCluster.operating;
        }

        if($scope.names.length > 0) {
             //切下拉列表时默认选中第一个
             $scope.select_name = $scope.names[0];
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
            $scope.select_type = STR_OPERABLE;  //默认到可以出库
            $scope.projectTypeChanged();
            if(pageReady){
                $scope.$apply();
            }
        }

        function errorCallback(error) {
            //error code
        }
    }

    requestProjectList();
    //偷鸡取巧的解决方法, 最好还是把XXX楼XXX栋这些汉字换成英文
    //10ms内禁止再发同样的内容发送第二次
    //扫码枪在识别到汉字的时候，会发送一次回车按键消息，此时会向服务器提交一次出库请求
    //扫码结束后，会再发一次回车按键消息，再次提交请求的时候，由于第一次出库完成了，所以第二次会报提示
    var duplicateRemoval = new OutgoingDuplicateRemoval();
    $scope.ScanKeyDown = function (e) {
        var projectName = $scope.select_name;
        if (e.key == "Enter"){
            var projectId = $scope.scan_text;
            if(duplicateRemoval.canDoOutGoing(projectName, projectId)){
                 duplicateRemoval.beginOutGoing(projectName, projectId, duplicateRemoval);
                 $http.get("http://localhost:8080/out-going?name=" + projectName + "&productId=" + projectId)
                     .then(scanSuccessCallback, scanErrorCallBack);
            }
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

    $("#btn_start_scan").click(function (e) {
        e.preventDefault();
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
        startOutGoing();
    });

    $("#btn_generate_list").click(function (e) {
        e.preventDefault()
        updateProjectStatus($scope.select_name, projectType.OPERABLE);
        if ($("#btn_start_scan").hasClass("disabled")) {
            $("#btn_start_scan").removeClass("disabled");
            $("#btn_stop_scan").addClass("disabled");
        }
        $("#scan_input").off("blur");
        $("#scan_input").blur();
        $('#myModal').modal('show');
    })

    $("#btn_stop_scan").click(function (e) {
        e.preventDefault();
        updateProjectStatus($scope.select_name, projectType.OPERABLE);
        $("#btn_start_scan").removeClass("disabled");
        $(this).addClass("disabled");
        $("#scan_input").off("blur");
        $("#scan_input").blur();
        endOutGoing();
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
            default:
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

    var projectStateBeforeOutGoing = -1;
    function startOutGoing() {
        projectStateBeforeOutGoing = ($scope.select_type == STR_OPERABLE) ? projectType.OPERABLE : projectType.OPERATING;
        if (projectStateBeforeOutGoing == projectType.OPERABLE) {
            //选择的工程是一个 可以出库 的状态
            //1. 把所选的工程插入到正在出库的工程名列表的最后一个
            $scope.projectCluster.operating.push($scope.select_name);
            $scope.select_type = STR_OPERATING;
        }
        enableSelector(false);
        $scope.$apply();
    }

    function endOutGoing() {
        //1. 获取当前操作的工程的工程状态
        var projectStateAfterOutGoing = getProjectState($scope.select_name);
        //2.1 如果出库前是可以出库状态
        if (projectStateBeforeOutGoing == projectType.OPERABLE) {
            if(projectStateAfterOutGoing != projectType.OPERATING) {
                //2.1.1 出库后不是正在出库状态，需要从正在出库列表中取出来刚才的工程名
                //如果出库前是可以出库，那么该工程名会被加到正在出库的工程列表中
                //出库结束后，如果该工程不是一个正在出库状态，需要从列表中去除刚才加进去的工程名
                console.log("1:1")
                $scope.projectCluster.operating.pop();
                $scope.select_type = STR_OPERABLE;
            }
        }
        //2.2 变成了出库完毕了
        if(projectStateAfterOutGoing == projectType.EXHAUSTED) {
            //2.2.1 切换到可以出库里的第一个
            //2.2.1.1 删除掉原有集合中的指定元素
            var projectNameArrayBeforeOutGoing = projectStateBeforeOutGoing == projectType.OPERABLE ?
                $scope.projectCluster.operable : $scope.projectCluster.operating;
            var index = projectNameArrayBeforeOutGoing.indexOf($scope.select_name);
            if(index > -1) {
                projectNameArrayBeforeOutGoing.splice(index, 1);
            }
            //2.2.1.2 定位到指定位置上
            $scope.select_type = STR_OPERABLE;
            $scope.select_name = $scope.projectCluster.operable.length > 0 ? $scope.projectCluster.operable[0] : "";
        }
        enableSelector(true);
        projectStateBeforeOutGoing = -1;
        $scope.$apply();
    }
});

