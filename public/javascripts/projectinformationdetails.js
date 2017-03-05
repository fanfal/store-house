/*global $ */
String.prototype.format = function(){
    var args = arguments;
    return this.replace(/\{(\d+)\}/g,
        function(m,i){
            return args[i];
        });
}

var building = null;
var unit = null;
var number = null;
var floor = null;
var position = null;
var type = null;
var width = null;
var height = null;
var projName = "";
var bInited = false;

function onInsertBtnClicked() {
    var modalDialog = $("#pop-up-dialog-modal");
    //弹出模态窗口
    modalDialog.css("display", "show");
    modalDialog.dialog({
                modal:true,
                height:360,
                width:600,
                show:{effect:'drop', direction:'up'},
                hide:{effect:'drop', direction:'down'},
                position: {
                          at : "center top+10%",
                　　　　　　of: window,
                　　　　　　collision: "fit",
                　　　　}
                });
    $(".ui-dialog-titlebar").css("display","none");
}

function clearUp() {
   building.val("");
   unit.val("");
   number.val("");
   floor.val("");
   position.val("");
   type.val("");
   width.val("");
   height.val("");
}

function showSucHint(hintValue) {
    $("#hint").html(hintValue);
            $("#hint").attr("class", "suchint-show");
            var interval = setInterval(function () {
                            $("#hint").attr("class", "suchint-hide");
                            clearTimeout(interval);
                        }, 3000);
}

function showFailHint(hintValue) {
    $("#hint").html(hintValue);
            $("#hint").attr("class", "errhint-show");
            var interval = setInterval(function () {
                            $("#hint").attr("class", "errhint-hide");
                            clearTimeout(interval);
                        }, 3000);
}

function initTable() {
    var table = $("table[grid-manager]");
    table.GM({
                   disableCache: true
                   ,i18n:'zh-cn'
                   ,supportCheckbox: true
                   ,supportRemind: true
                   ,supportAjaxPage:true
                   ,isCombSorting: false
                   ,pageSize : 20
                   ,columnData: [{
                        key: 'building',
                        remind: 'the building',
                        text: '栋',
                        width : '50px',
                        },{
                        key: 'unit',
                        remind: 'the unit',
                        text: '单元',
                        width : '50px',
                        },{
                        key: 'floor',
                        remind: 'the floor',
                        width : '50px',
                        text: '楼'
                        },{
                        key: 'number',
                        remind: 'the number',
                        width: '50',
                        text: '号'
                        },{
                        key: 'position',
                        remind: 'the position',
                        width: '100px',
                        text: '洞'
                        },{
                        key: 'type',
                        remind: 'the type',
                        width: '50px',
                        text: '类型'
                        },{
                        key: 'width',
                        remind: 'the width',
                        width: '80px',
                        text: '宽度'
                        },{
                        key: 'height',
                        remind: 'the height',
                        width: '80px',
                        text: '高度'
                        }],
                   ajax_url : "http://localhost:8080/getData/projectInfo",
                   ajax_type : 'POST'
                   ,query : {name : projName}
                   ,height : ['500px']
                   ,pagingBefore: function(query){
                   			console.log('pagingBefore', query);
                   		}
                   		// 分页后事件
                   ,pagingAfter: function(data){
                   			console.log('pagingAfter', data);
                   		}
                    });

}

function onSubmit () {
    //1. 检查
    var bInvalid = false;
    $(".line-edit").each(function () {
        if($(this).val() == ''){
            bInvalid = true;
        }
    })

    if(bInvalid) {
        showFailHint("参数不能为空")
    }
    else{
        function refreshTable() {
            $("table[grid-manager]").GM('refreshGrid', false);
        }
        function insertSuc (data) {
            $("#submit").onclick = onSubmit();
            showSucHint("添加成功");
            //刷新一下表格
            refreshTable();
        }

        function insertErr (data) {
            $("#submit").onclick = onSubmit();
            showFailHint("添加失败");
        }
        //发送
        var projInfoList = new Array();
        var singleProjInfo = {}
        singleProjInfo.project_name = parent.getProjectInfoName();
        singleProjInfo.building = building.val();
        singleProjInfo.unit = unit.val();
        singleProjInfo.number = number.val();
        singleProjInfo.floor = floor.val();
        singleProjInfo.position = position.val();
        singleProjInfo.type = type.val();
        singleProjInfo.width = width.val();
        singleProjInfo.height = height.val();
        singleProjInfo.is_stored = true;
        projInfoList.push(singleProjInfo);
        $("#submit").onclick = function () {}
        var url = "http://localhost:8080/insertData/projectInfo";
        $.ajax({
                url : url,
                type : "POST",
                data : singleProjInfo,
                dataType: "JSON",
                success : insertSuc,
                error : insertErr
            });
    }
    clearUp();
}

function onCancel() {
    clearUp();
    var modalDialog = $("#pop-up-dialog-modal");
    modalDialog.dialog("close");
}

function initControls() {
        building = $("#building");
        unit = $("#unit");
        number = $("#number");
        floor = $("#floor");
        position = $("#position");
        type = $("#type");
        width = $("#width");
        height = $("#height");
        usage = parent.getUsage();
        projName = parent.getProjectInfoName();
}

$(document).ready(function () {
    initControls();
    $("#table-head").html(projName);
    //1. 初始化表格
    initTable();
});