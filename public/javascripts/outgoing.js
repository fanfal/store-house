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
        resetOutgoingData($scope);
        $scope.operatingProjectName = "";
    }

    $("#autocompleteProjectNameInput").on("change", function() {
        if ($("#autocompleteProjectNameInput").val().trim() == "") {
            $scope.operatingProjectName = "";
        }
    })

    $("#autocompleteProjectNameInput").autocomplete({
            source : function (request, response) {
                var input = request.term;
                if (input == '') {
                    $scope.operatingProjectName = "";
                    return
                }
                var url = c_getProjectsURL;
                url += "?projectFilter=" + input;
                url += "&status=" ;
                url += $scope.select_type == STR_OPERATING ? projectType.OPERATING : projectType.OPERABLE;
                $.ajax({
                       url: url,
                       type: "GET",
                       async: true,
                       success: function (data) {
                           var projects = data.project_list;
                           var autoCompleteResult = new Array;
                           projects.forEach(function (item) {
                               var itemJson = {label:item.project_name, value:item.project_name};
                               autoCompleteResult.push(itemJson);
                           })
                           response(autoCompleteResult);
                       }
                })
            },
            select : function (event, ui) {
                var selection = ui.item.label;
                //选择改变, 拉取数据
                if (selection != $scope.operatingProjectName) {
                    $scope.operatingProjectName = selection;
                }
                resetOutgoingData()
                $scope.$apply();
            }
    });

    function enableSelector(bEnable) {
        if(bEnable){
            $("#project_type_select").attr("disabled", false);
            $("#autocompleteProjectNameInput").attr("disabled", false);
        }
        else{
            $("#project_type_select").attr("disabled", true);
            $("#autocompleteProjectNameInput").attr("disabled", true);
        }

    }

    function resetOutgoingData() {
        $scope.productCount = {};
        $scope.productCount.frameNum = 0;
        $scope.productCount.fanNum = 0;
        $scope.productCount.glassNum = 0;
        $scope.productCount.otherNum = 0;
        $scope.items = [];
    }

    var projectTypeArray = [STR_OPERATING, STR_OPERABLE];
    $scope.projectType = projectTypeArray;  //工程类型列表
    $scope.select_type = projectTypeArray[0];
    //偷鸡取巧的解决方法, 最好还是把XXX楼XXX栋这些汉字换成英文
    //10ms内禁止再发同样的内容发送第二次
    //扫码枪在识别到汉字的时候，会发送一次回车按键消息，此时会向服务器提交一次出库请求
    //扫码结束后，会再发一次回车按键消息，再次提交请求的时候，由于第一次出库完成了，所以第二次会报提示
    var duplicateRemoval = new OutgoingDuplicateRemoval();
    $scope.ScanKeyDown = function (e) {
        var projectName = $scope.operatingProjectName;
        if (e.key == "Enter"){
            var projectId = $scope.scan_text;
            if(duplicateRemoval.canDoOutGoing(projectName, projectId)){
                 duplicateRemoval.beginOutGoing(projectName, projectId, duplicateRemoval);
                 $http.get( c_outgoingURL + projectName + "&productId=" + projectId)
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
            data[0].area = (data[0].width * data[0].height).toFixed(1)
            projectInfo = data.concat(projectInfo);
            $scope.items = projectInfo;
        }
        $scope.scan_text = "";
    }

    function scanErrorCallBack(error) {

    }

    $("#btn_start_scan").click(function (e) {
        e.preventDefault();
        if ($scope.operatingProjectName == "") {
            showProjectEmptyAlert();
            $scope.scan_text = "";
            return;
        }
        disableBtn($(this), true)
        disableBtn($("#btn_stop_scan"), false)
        disableBtn($("#btn_generate_list"), false)

        $("#scan_input").focus();
        $("#scan_input").blur(function () {
            $(this).focus();
        });
        updateProjectStatus($scope.operatingProjectName, projectType.OPERATING);
        startOutGoing();
    });

    $("#btn_generate_list").click(function (e) {
        e.preventDefault()
        updateProjectStatus($scope.operatingProjectName, projectType.OPERABLE);
        // if ($("#btn_start_scan").hasClass("disabled")) {
        //     $("#btn_start_scan").removeClass("disabled");
        //     $("#btn_stop_scan").addClass("disabled");
        // }
        $("#scan_input").off("blur");
        $("#scan_input").blur();
        $('#myModal').modal('show');
    })

    $("#btn_stop_scan").click(function (e) {
        e.preventDefault();
        updateProjectStatus($scope.operatingProjectName, projectType.OPERABLE);

        disableBtn($("#btn_start_scan"), false)
        disableBtn($("#btn_stop_scan"), true)
        disableBtn($("#btn_generate_list"), true)
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
            url: c_statusURL,
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
            $scope.select_type = STR_OPERATING;
        }
        enableSelector(false);
        $scope.$apply();
    }

    function endOutGoing() {
        var projectStateAfterOutGoing = getProjectState($scope.operatingProjectName);
        $scope.select_type = projectStateAfterOutGoing == projectType.OPERATING ?
                             STR_OPERATING : STR_OPERABLE;
        if (projectStateAfterOutGoing == projectType.EXHAUSTED) {
            $("#autocompleteProjectNameInput").val("")
        }
        enableSelector(true);
        $scope.$apply();
    }

    function disableBtn(btn, disabled) {
        btn.attr("disabled", disabled)
    }
});

