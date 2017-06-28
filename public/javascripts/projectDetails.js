/*global $*/

const c_selOperating = "selOperating";
const c_selOperable = "selOperable";
const c_selExhausted = "selExhausted";
const c_selAll = "selAll";
const FILTER_TYPE_COUNT = 6;
const UNSTORED_ROW_COLOR = "#E2E2E2";
const STORED_ROW_COLOR = "#DDFFDD";
const OUT_OF_STORE_STATE = "已出库";
const IN_STORE_STATE = "在库";
var colorArray = [];
colorArray.push(UNSTORED_ROW_COLOR);
colorArray.push(STORED_ROW_COLOR);


var inputList = new Array;
var selectionIds = [];
var selected = [];
var app = angular.module("projectDetails", []);
var $myScope = null;
var isInsertProjectInfoModel = true;

app.filter('exportTableFilter', function () {
    return function (x) {
        if (x == true) {
            return IN_STORE_STATE;
        } else {
            return OUT_OF_STORE_STATE;
        }
    };
});

app.controller("exportController",
    function ($scope) {
        $myScope = $scope;
        $scope.update = function (data) {
            $scope.selected = data;
            $scope.$apply();
        }
    });


function tolerance() {
    this.widthTolerance = 0.0;
    this.heightTolerance = 0.0;
    this.validityCheck = function () {
        var width = $("#widthTolerance").val();
        var height = $("#heightTolerance").val();
        var pattern = /^(-)?\d+(\.\d+)?$/;
        if (width == "" || height == "") {
            return false;
        }
        else if (pattern.exec(width) == null || pattern.exec(height) == null) {
            return false;
        }
        else {
            return true;
        }
    }
    this.onConfirm = function () {
        if (!this.validityCheck()) {
            showMessageBox("误差值输入错误,误差值不能为空且只能为数字.");
            return;
        }
        var widthTolerance = parseFloat($("#widthTolerance").val());
        var heightTolerance = parseFloat($("#heightTolerance").val());
        if ((widthTolerance != this.widthTolerance) || (heightTolerance != this.heightTolerance)) {
            toleranceHandler.widthTolerance = widthTolerance;
            toleranceHandler.heightTolerance = heightTolerance;
            //拉取数据
            projDetailsModelInstance.table.pullData(projDetailsModelInstance.getOption(projDetailsModelInstance));
            //改变内存数据
            for (var i = 0; i < selected.length; ++i) {
                var width = parseFloat(selected[i].width);
                var height = parseFloat(selected[i].height);
                width += toleranceHandler.widthTolerance;
                height += toleranceHandler.heightTolerance;
                selected[i].width = width.toFixed(1);
                selected[i].height = height.toFixed(1);
            }
            $myScope.update(selected);
        }
        $("#projReciverModalDialog").modal('hide');
    }
    this.onCancel = function () {
        $("#projReciverModalDialog").modal('hide');
    }
}
var toleranceHandler = new tolerance();
function initInputList() {
    var building = {name: "building", control: $("#building")};
    var unit = {name: "unit", control: $("#unit")};
    var floor = {name: "floor", control: $("#floor")};
    var number = {name: "number", control: $("#number")};
    var position = {name: "position", control: $("#position")};
    var type = {name: "type", control: $("#typeSelect")};
    var width = {name: "width", control: $("#width")};
    var height = {name: "height", control: $("#height")};
    inputList.push(building);
    inputList.push(unit);
    inputList.push(floor);
    inputList.push(number);
    inputList.push(position);
    inputList.push(type);
    inputList.push(width);
    inputList.push(height);
    inputList.push(height);
    inputList.forEach(function (item) {
        item.control.poshytip({
            className: 'tip-yellowsimple',
            content: function (updateCallback) {
                return $("#toolTipInvisible").html();
            },
            showOn: 'none',
            alignTo: 'target',
            alignX: 'right',
            alignY: 'center',
            offsetX: 10,
            slide: false,
            elemAppendTo: $("#projInfoModalDialog")
        });
    });

}

//自己实现一个tableview
function bootStrapTable(bootStrapTableElement, model) {
    this.model = model;
    this.tableInstance = bootStrapTableElement;
    this.pullData = function (option) {
        this.tableInstance.bootstrapTable('destroy');
        this.tableInstance.bootstrapTable(option);
    }
}

function projectDetailsModel() {
    /////////////////////////////////////////成员变量/////////////////////////////////////////
    this.queryURL = c_getProjectInfoURL;
    this.additionalQueryParams = {};
    this.projectNamesArray = [];
    this.projectDetailsStateMachine = new projectDetailsStateMachine()
    this.pageNumber = 1;
    this.mainContainer = $("#Container");
    this.selectedProjectType = -1;
    this.table = new bootStrapTable($("#bootstrapTable"), this);
    this.insertBtn = $("#insertBtn");   //添加按钮
    this.operatingProject = "";        //现在正在操作的工程表
    this.inputtingProject = "";        //正在输入的工程名
    this.selectors = {
        projectTypeSelect: $("#projectTypeSelect"),
    }
    this.projTypeOptions = {
        selOperating: $("option[value = 'selOperating']"),
        selOperatable: $("option[value = 'selOperable']"),
        selExhausted: $("option[value = 'selExhausted']"),
        selAll: $("option[value = 'selAll']")
    }

    /////////////////////////////////////////成员函数/////////////////////////////////////////
    //往工程下拉列表中追加选项
    this.appendOptionsToProjectPickList = function (projectNamePickList) {
        $("#bootstrapTable").bootstrapTable('removeAll');
        model.projectNamesArray = projectNamePickList;
    }
    //生成ajax请求的url
    this.generateAjaxUrl = function () {
        return c_getProjectsURL;
    }

    this.singleSelect = function (id, option) {
        $("#" + id + " option").attr("selected", false);
        option.attr("selected", true);
    }
    this.getQueryURL = function () {
        return this.queryURL;
    }
    this.getOption = function (model) {
        var option = {
            url: model.getQueryURL(),
            method: "post",
            responseHandler: responseHandler,
            // rowStyle : rowStyleHandler,
            cache: false,
            pagination: true,
            queryParams: model.getQueryParams,
            sidePagination: "server",
            pageNumber: model.pageNumber,
            pageSize: 10,
            pageList: [10, 15, 20],
            uniqueId: "id",
            cardView: false,
            detailView: false,
            columns: model.getTableColumn(),
            dataType: 'json',
            exportOptions: {
                fileName: this.operatingProject,
                worksheetName: this.operatingProject,
            }
        };
        return option;
    }
    /////////////////////////////////////////事件回调/////////////////////////////////////////////////
    //工程类别下拉列表变化
    var model = this;
    this.resetProjectRelatedParams = function (projectName) {
        model.operatingProject = projectName;
        model.additionalQueryParams = {};
        selectionIds = [];
        selected = [];
        model.projectDetailsStateMachine.enableExport(false);
        $myScope.update(selected)
    }

    this.operatingProjectChanged = function (projectName) {
        $("#operatingTableLabel").html(projectName);
        modifyInsertBtnAndUploadBtnStatus(true);
        model.resetProjectRelatedParams(projectName);
        model.projectDetailsStateMachine.enableInsert(true);
    }

    this.projectTypeSelectChanged = function () {
        var selection = model.selectors.projectTypeSelect.val();
        if (selection == c_selOperating) {
            model.selectedProjectType = projectType.OPERATING;
        }
        else if (selection == c_selOperable) {
            model.selectedProjectType = projectType.OPERABLE;
        }
        else if (selection == c_selExhausted) {
            model.selectedProjectType = projectType.EXHAUSTED;
        }
        else {
            model.selectedProjectType = projectType.ALL;
        }
        model.projectDetailsStateMachine.setSelectedProjectType(model.selectedProjectType);
        $("#bootstrapTable").bootstrapTable('removeAll');
        $("#autocompleteProjectNameInput").val("");
        model.resetProjectRelatedParams("");
    }

    /////////////////////////////////////////bootstrapTable用/////////////////////////////////////////


    this.getQueryParams = function (params) {
        params.filterCondition = model.additionalQueryParams;
        params.filterCondition.project_name = model.operatingProject;
        return params;
    }

    this.getTableColumn = function () {
        var columns = [{
            title: "全选",
            field: "select",
            checkbox: true,
            width: 20,//宽度
            align: "center",//水平
            valign: "middle"//垂直
        }, {
            field: 'building',
            title: '栋'
        }, {
            field: 'unit',
            title: '单元'
        }, {
            field: 'floor',
            title: '楼'
        }, {
            field: 'number',
            title: '号'
        }, {
            field: 'position',
            title: '洞'
        }, {
            field: 'type',
            title: '类型'
        }, {
            field: 'width',
            title: '宽度(mm)'
        }, {
            field: 'height',
            title: '高度(mm)'
        }, {
            field: 'is_stored',
            title: '是否出库',
            formatter: function (value, row, index) {
                if (value) {
                    return "在库";
                }
                else {
                    return "已出库";
                }
            },
            cellStyle: function (value, row, index) {
                return {css: {"background": value ? colorArray[1] : colorArray[0]}}
            }
        }];
        return columns;
    }

    //拉取工程列表
    var projDetailsModel = this;
    this.pullProjectList = function () {
        model.singleSelect("projectTypeSelect", model.projTypeOptions.selAll);
        projDetailsModel.projectTypeSelectChanged();
    }

    //初始化
    this.Init = function () {
        //1. 项目名称自动填充
        $("#autocompleteProjectNameInput").autocomplete({
            source: function (request, response) {
                var input = request.term;
                var url = c_getProjectsURL;
                var bNeedStatus = model.selectedProjectType != projectType.ALL;
                url += "?projectFilter=" + input
                if (bNeedStatus) {
                    url += "&status=" + model.selectedProjectType;
                }
                $.ajax({
                    url: url,
                    type: "GET",
                    async: true,
                    success: function (data) {
                        var projects = data.project_list;
                        var autoCompleteResult = new Array;
                        projects.forEach(function (item) {
                            var itemJson = {label: item.project_name, value: item.project_name};
                            autoCompleteResult.push(itemJson);
                            if (item.project_name == input) {
                            }
                        })
                        response(autoCompleteResult);
                    }
                })
            },
            select: function (event, ui) {
                var selection = ui.item.label;
                //选择改变, 拉取数据
                model.operatingProjectChanged(selection);
                model.table.pullData(model.getOption(model));
            }
        });

        //2. 绑定下拉列表变化事件
        this.selectors.projectTypeSelect.change(this.projectTypeSelectChanged);
        //3. 初始化表格
        this.table.pullData(this.getOption(this));
        //选中事件操作数组
        var union = function (array, ids, rows) {
            $.each(ids, function (i, id) {
                if ($.inArray(id, array) == -1) {
                    array[array.length] = id;
                    selected.push(rows[i]);
                }
            });
            if (array.length > 0) {
                projDetailsModelInstance.projectDetailsStateMachine.enableExport(true);
            }
            return array;
        };
        //取消选中事件操作数组
        var difference = function (array, ids, rows) {
            $.each(ids, function (i, id) {
                var index = $.inArray(id, array);
                if (index != -1) {
                    selected.splice(index, 1);
                    array.splice(index, 1);
                }
            });
            if (array.length == 0) {
                projDetailsModelInstance.projectDetailsStateMachine.enableExport(false);
            }
            return array;
        };
        var _ = {"union": union, "difference": difference};
        //绑定选中事件、取消事件、全部选中、全部取消
        $("#bootstrapTable").on('check.bs.table check-all.bs.table uncheck.bs.table uncheck-all.bs.table', function (e, rows) {
            var touchedRows = !$.isArray(rows) ? [rows] : rows;
            var ids = $.map(!$.isArray(rows) ? [rows] : rows, function (row) {
                return row.id;
            });
            func = $.inArray(e.type, ['check', 'check-all']) > -1 ? 'union' : 'difference';
            selectionIds = _[func](selectionIds, ids, touchedRows);
            $myScope.update(selected);
        });
        //切换页
        $("#bootstrapTable").on('page-change.bs.table', function (number, size) {
            projDetailsModelInstance.pageNumber = number;
        })

        //4. 获取工程列表
        this.pullProjectList();
        modifyInsertBtnAndUploadBtnStatus(false);
    }

    this.onInsertSuc = function () {
        this.projectDetailsStateMachine.insertDone();
    }
}

var projDetailsModelInstance = null;
$(document).ready(function () {
    projDetailsModelInstance = new projectDetailsModel();   //数据模型
    //初始化模型
    projDetailsModelInstance.Init();
    initInputList();
})


function onInsert() {
    if (isProjectSelected()) {
        isInsertProjectInfoModel = true;
        $("#projInfoModalDialog").find("#myModalLabel").text("创建");
        $("#projInfoModalDialog").modal('show');
    }
}

function isProjectSelected() {
    if (!projDetailsModelInstance.projectDetailsStateMachine.insertEnable) {
        showMessageBox("请选择一个项目.");
        return false;
    }
    return true;
}

function isProjectInfoSelected(errHint) {
    if (selected.length == 0) {
        showMessageBox(errHint);
        return false;
    }
    return true;
}

function isOnlyOneProjectInfoSelect() {
    if (selected.length == 1) {
        return true;
    }
    showMessageBox("请只勾选一条数据.");
    return false;
}

function onDelete() {
    if (isProjectInfoSelected("请勾选要删除的项.") && isProjectSelected()) {
        $("#deletAlertDialog").modal('show');
    }
}

function finalDelete() {
    var data = {
        project_info_list: selected
    };
    $.ajax({
        url: c_deleteProjectInfoURL,
        type: "POST",
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify(data),
        dataType: "json",
        async: false,
        success: function (data) {
            $("#deletAlertDialog").modal('hide');
            selected = [];
            projDetailsModelInstance.table.pullData(projDetailsModelInstance.getOption(projDetailsModelInstance));
        },
        error: function (data) {
            $("#deletAlertDialog").modal('hide');
            showMessageBox(data.errorMessage);
            projDetailsModelInstance.table.pullData(projDetailsModelInstance.getOption(projDetailsModelInstance));

        }
    })
    projDetailsModelInstance.projectDetailsStateMachine.afterRemove(projDetailsModelInstance);
}

function onConfirm() {
    function checkValidity() {
        var errInputIndex = -1;
        $(".projInfoInput").each(function (index) {
            var value = $(this).val();
            if (value == "") {
                errInputIndex = index;
                return false;
            }
            if ($(this).attr("id") == "width" || $(this).attr("id") == "height") {
                var pattern = /^(-)?\d+(\.\d+)?$/;
                if (pattern.exec(value) == null) {
                    errInputIndex = index;
                    return false
                }
            }
        });
        if (errInputIndex != -1) {
            inputList[errInputIndex].control.poshytip('show')
            var timer = setInterval(function () {
                inputList[errInputIndex].control.poshytip('hide')
                clearInterval(timer);
            }, 3000);
            return false;
        }
        else {
            return true;
        }
    }

    function feedBack(bSuc, msg) {
        if (bSuc) {
            $(".alert").addClass("alert-success");
        }
        else {
            $(".alert").addClass("alert-danger");
        }
        $(".alert").html(msg);
        $(".alert").css("display", "block");
        $(".alert").fadeIn();
        var timer = setInterval(function () {
            $(".alert").removeClass("alert-success");
            $(".alert").removeClass("alert-danger");
            $(".alert").css("display", "none");
            clearInterval(timer);
        }, 3000)

    }

    function insertProjectInfo() {
        function getInsertData() {
            var res = {};
            res.project_name = projDetailsModelInstance.operatingProject;
            res.is_stored = true;
            for (var i = 0; i < inputList.length; ++i) {
                res[inputList[i].name] = inputList[i].control.val();
            }
            return res;
        }

        $.ajax({
            url: c_insertProjectInfoURL,
            type: "POST",
            data: getInsertData(),
            dataType: 'json',
            async: false,
            success: function (data) {
                emptyProjectInfoModel();
                feedBack(true, "添加成功");
                projDetailsModelInstance.onInsertSuc();
                projDetailsModelInstance.table.pullData(projDetailsModelInstance.getOption(projDetailsModelInstance));
            },
            error: function (data) {
                var msg = "添加失败";
                if (data.responseJSON != null) {
                    if (data.responseJSON.errorMessage == "Product was stored.") {
                        msg += ", 该项目在库.";
                    }
                    else if (data.responseJSON.errorMessage == "Update product error.") {
                        msg += ", 在插入项目时发生异常.";
                    }
                }
                feedBack(false, msg);
            }
        })
    }

    function updateProjectInfo(updateData) {
        $.ajax({
            url: c_updateProjectInfoUrl,
            type: "POST",
            data: JSON.stringify(updateData),
            dataType: 'json',
            contentType: 'application/json; charset=UTF-8',
            async: false,
            success: function (data) {
                selected = [];
                selectionIds = [];
                emptyProjectInfoModel();
                projDetailsModelInstance.onInsertSuc();
                projDetailsModelInstance.table.pullData(projDetailsModelInstance.getOption(projDetailsModelInstance));
                $("#projInfoModalDialog").modal('hide');

            },
            error: function (data) {
                var msg = "更新失败";
                if (data.responseJSON != null) {
                    if (data.responseJSON.errorMessage == "Product was stored.") {
                        msg += ", 该项目在库.";
                    }
                    else if (data.responseJSON.errorMessage == "Update product error.") {
                        msg += ", 在插入项目时发生异常.";
                    }
                }
                feedBack(false, msg);
            }
        })
    }

    function getUpdateData() {
        var data = {};
        data.new = {};
        data.origin = {};

        data.new.project_name = data.origin.project_name = $("#projectListSelect").val();

        data.new.building = $("#projInfoModalDialog").find("#building").val();
        data.origin.building = selected[0].building;

        data.new.unit = $("#projInfoModalDialog").find("#unit").val();
        data.origin.unit = selected[0].unit;

        data.new.floor = $("#projInfoModalDialog").find("#floor").val();
        data.origin.floor = selected[0].floor;

        data.new.number = $("#projInfoModalDialog").find("#number").val();
        data.origin.number = selected[0].number;

        data.new.position = $("#projInfoModalDialog").find("#position").val();
        data.origin.position = selected[0].position;

        data.new.type = $("#projInfoModalDialog").find("#typeSelect").val();
        data.origin.type = selected[0].type;

        data.new.width = $("#projInfoModalDialog").find("#width").val();
        data.origin.width = selected[0].width;

        data.new.height = $("#projInfoModalDialog").find("#height").val();
        data.origin.height = selected[0].height;

        return data;
    }

    if (checkValidity()) {
        //插入
        if (isInsertProjectInfoModel) {
            insertProjectInfo();
        } else {
            var data = getUpdateData();
            updateProjectInfo(data);
        }
    }
}

function responseHandler(res) {
    var count = 0;
    $.each(res.rows, function (i, row) {
        ++count;
        row.select = $.inArray(row.id, selectionIds) != -1; //判断当前行的数据id是否存在与选中的数组，存在则将多选框状态变为true
        var width = parseFloat(row.width);
        var height = parseFloat(row.height);
        width += toleranceHandler.widthTolerance;
        height += toleranceHandler.heightTolerance;
        row.width = width.toFixed(1);
        row.height = height.toFixed(1);
    });
    if (count > 0) {
        //不是一个空工程
        projDetailsModelInstance.projectDetailsStateMachine.isSelectedProjectEmpty = false;
    }
    return res;
}

function rowStyleHandler(row, index) {
    //return {css : {"background" : row.is_stored ? colorArray[1] : colorArray[0]}}
}

function onCancel() {
    $("#projInfoModalDialog").modal('hide');
}

$("#projInfoModalDialog").on("hidden.bs.modal", function () {
    emptyProjectInfoModel();
})

function onConfirmProjReciver() {
    $("#widthTolerance").val(toleranceHandler.widthTolerance);
    $("#heightTolerance").val(toleranceHandler.heightTolerance);
    $("#projReciverModalDialog").modal('show');
}

function onExport() {
    //if($("#exportBtn").attr("disable") == true){return;}

    if (!projDetailsModelInstance.projectDetailsStateMachine.exportEnable) {
        //不允许导出
        showMessageBox("请勾选要导出的项.");
        return;
    }

    var option = {
        csvSeparator: ',',
        csvEnclosure: '"',
        consoleLog: false,
        displayTableName: false,
        escape: false,
        excelstyles: ['border-bottom', 'border-top', 'border-left', 'border-right'],
        fileName: projDetailsModelInstance.operatingProject,
        htmlContent: true,
        ignoreColumn: [],
        jspdf: {
            orientation: 'p',
            unit: 'pt',
            format: 'a4',
            margins: {left: 20, right: 10, top: 10, bottom: 10},
            autotable: {
                padding: 2,
                lineHeight: 12,
                fontSize: 8,
                tableExport: {
                    onAfterAutotable: null,
                    onBeforeAutotable: null,
                    onTable: null
                }
            }
        },
        onCellData: null,
        outputMode: 'file',  // file|string|base64
        tbodySelector: 'tr',
        theadSelector: 'tr',
        tableName: 'myTableName',
        type: 'excel',
        worksheetName: projDetailsModelInstance.operatingProject
    };
    $("#invisiableTable").tableExport(option);
}


function setExportToExcelBtnEnable(bEnable) {
    if (bEnable) {
        $("#exportBtn").attr("disabled", false);
    }
    else {
        $("#exportBtn").attr("disabled", true);
    }
}

function onSubmitBtnClick() {
    var postURL = c_updateDataByExcelURL;
    postURL += projDetailsModelInstance.operatingProject;
    var formData = new FormData($("#uploadForm")[0]);
    $.ajax({
        url: postURL,
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function (data, status) {
            showMessageBox("上传数据成功.");
            $("#uploadModalDialog").modal('hide');
            projDetailsModelInstance.table.pullData(projDetailsModelInstance.getOption(projDetailsModelInstance));
        },
        error: function (xhr, desc, err) {
            showMessageBox(JSON.stringify(xhr.responseJSON.errorMessage));
            $("#uploadModalDialog").modal('hide');

        }
    });

    $("uploadButton").addClass("disabled");
}

function showMessageBox(msg) {
    $("#messageBoxHint").html(msg);
    $("#messageBox").modal('show');
}
function hideMessageBox() {
    $("#messageBox").modal('hide');
}

function onUpload() {
    if (isProjectSelected()) {
        $("#uploadModalDialog").modal('show');
    }
}

String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g,
        function (m, i) {
            return args[i];
        });
}

function onPrint() {
    if (!isProjectInfoSelected("请勾选要打印的项.")) {
        return;
    }
    var bodyContent = document.getElementById('qr-content');
    var qrcodedraw = new qrcodelib.qrcodedraw()
    cleanOldQRCode(bodyContent);
    var index = 0;
    selected.forEach(function (data) {
        if (data.product_id != null) {
            createQRCode(data, bodyContent, qrcodedraw, index++);
        }
    });
    $("#printQRCodeDialog").modal('show');
}

function cleanOldQRCode(bodyContent) {
    while (bodyContent.hasChildNodes()) {
        bodyContent.removeChild(bodyContent.lastChild);
    }
}

function createQRCode(data, bodyContent, qrDraw, index) {

    var subContent = document.createElement('div');
    subContent.id = "qr_" + index.toString();
    subContent.classList.add("row");
    subContent.classList.add("qrSubContent");
    var qrImageRow = document.createElement('div');
    qrImageRow.classList.add("row");
    var qrCode = document.createElement('canvas');
    qrCode.classList.add("qrCanvas");
    qrDraw.draw(qrCode, data.product_id, {type: "Byte"}, function (error, canvas) {
    });
    var qrImage = document.createElement('img');
    qrImage.src = qrCode.toDataURL();
    qrImageRow.appendChild(qrImage);

    var text = document.createElement("h");
    text.textContent = data.product_id;

    subContent.appendChild(qrImageRow);
    subContent.appendChild(text);
    bodyContent.appendChild(subContent);
}

function printQRCodes() {
    $("#printQRCodeDialog").modal('hide');
    $("body").append("<div id = 'invisible' style='display:none'></div>");
    $("#invisible").append("<div id = 'printTemplate' class = 'singleQR' style='width:30mm;margin:0;padding:0;'></div>");
    var template = $("#printTemplate");
    var index = 0;
    var count = $("#qr-content").children().length;
    var height = 0;
    $("#qr-content").children().each(function () {
        height += 60;
        //regenerate a new div for print
        var id = "singleQRContent_" + index.toString();
        ++index;
        template.append("<div id = " + id + " style='width:80mm;height:60mm;text-align:center;'></div>");
        var singleQR = $("#" + id);
        //1. 拿到图片
        $(this).find("img").each(function () {
            var imgStr = "<img src=" + $(this).attr("src") + " style='width:40mm;height:40mm;'><img>";
            singleQR.append(imgStr);
        })
        //2. 拿到h
        $(this).find("h").each(function () {
            var hStr = "<br><h style='text-align:center;height:20;font-size:3px'>" + $(this).html() + "</h>";
            singleQR.append(hStr);
        })
    });
    template.css("height", height);
    template.jqprint({
        debug: false,
        importCSS: false,
        printContainer: true,
        operaSupport: false,
        height: height
    })
    template.remove();
}

String.prototype.format = function () {
    var content = this;
    for (var i = 0; i < arguments.length; i++) {
        var replacement = '{' + i + '}';
        content = content.replace(replacement, arguments[i]);
    }
    return content;
};

$("#confirm-search").click(function () {
    $("#searchFilter").modal('hide');
    var searchingProjectName = $("#autocompleteProjectNameInput").val();
    if (searchingProjectName == null ||
        searchingProjectName == "") {
        showMessageBox("请先填写项目名称");
    } else {
        var selectorArray = new Array;
        selectorArray.push($("#query-buildingSelect"));
        selectorArray.push($("#query-unitSelect"));
        selectorArray.push($("#query-floorSelect"));
        selectorArray.push($("#query-numberSelect"));
        selectorArray.push($("#query-positionSelect"));
        selectorArray.push($("#query-typeSelect"));
        //确认搜索, 视为操作的工程变了, 否则工程的编辑状态很难同步
        projDetailsModelInstance.operatingProjectChanged(searchingProjectName)
        modifyInsertBtnAndUploadBtnStatus(true);
        function fillQueryParam() {
            var queryAdditionalCondition = {};
            selectorArray.forEach(function (selector, index) {
                var selection = selector.val();
                if (selection == null || selection == "") {
                }
                else {
                    queryAdditionalCondition[selector.attr("queryKey")] = selector.val();
                }
            });
            return queryAdditionalCondition;
        }

        querySearchFilterData(fillQueryParam())
    }
});

$("#cancel-search").click(function () {
    $("#searchFilter").modal('hide');
});


function querySearchFilterData(filterData) {
    //换一种方式, 通过修改参数, 改变bootstrap-table的POST参数
    var projectDetailsModel = projDetailsModelInstance;
    projectDetailsModel.additionalQueryParams = filterData;
    projectDetailsModel.table.pullData(projectDetailsModel.getOption(projectDetailsModel));
}

function getSearchFilterValue(element, projectName, filterType) {
    $.ajax({
        url: c_getFilterValueURL.format(projectName, filterType),
        type: "GET",
        dataType: 'json',
        success: function (data) {
            element.empty();
            element.append($("<option></option>")
                .attr("value", "")
                .text(""))
            data.filterData.forEach(function (value) {
                element.append($("<option></option>")
                    .attr("value", value[filterType])
                    .text(value[filterType]))
                element.find(":first").attr("selected", true);
            });
        },
        error: function (data) {
            console.log("fetch search filter error");
        }
    })
}

function queryIfProjectExists(projectName) {
    var res = false;
    $.ajax({
        url: c_getProject + "?name=" + projectName,
        type: "GET",
        dataType: 'json',
        async: false,
        success: function (data) {
            if (data != null) {
                res = true;
            }
        },
        error: function (data) {
            res = false;
        }
    })
    return res;
}


function onAccurateSearchClicked() {
    var searchingProjectName = $("#autocompleteProjectNameInput").val();
    if (searchingProjectName == null ||
        searchingProjectName == "") {
        showMessageBox("请先填写项目名称");
    }
    else {
        if (searchingProjectName != projDetailsModelInstance.operatingProject) {
            if (!queryIfProjectExists(searchingProjectName)) {
                var projectNotExistWarning = "项目 '{0}' 不存在 ";
                showMessageBox(projectNotExistWarning.format(searchingProjectName));
                return;
            }
        }
        $("#searchFilter").modal('show');
        getSearchFilterValue($("#query-buildingSelect"), searchingProjectName, "building")
        getSearchFilterValue($("#query-unitSelect"), searchingProjectName, "unit")
        getSearchFilterValue($("#query-floorSelect"), searchingProjectName, "floor")
        getSearchFilterValue($("#query-numberSelect"), searchingProjectName, "number")
        getSearchFilterValue($("#query-positionSelect"), searchingProjectName, "position")
    }
}

function onUpdate() {
    if (isProjectSelected()
        && isProjectInfoSelected("请勾选要修改的项目")
        && isOnlyOneProjectInfoSelect() && isProjectInfoStored(selected[0])) {
        isInsertProjectInfoModel = false;
        $("#projInfoModalDialog").find("#myModalLabel").text("更改");
        $("#projInfoModalDialog").find("#building").val(selected[0].building);
        $("#projInfoModalDialog").find("#unit").val(selected[0].unit);
        $("#projInfoModalDialog").find("#floor").val(selected[0].floor);
        $("#projInfoModalDialog").find("#number").val(selected[0].number);
        $("#projInfoModalDialog").find("#position").val(selected[0].position);
        $("#projInfoModalDialog").find("#width").val(selected[0].width);
        $("#projInfoModalDialog").find("#height").val(selected[0].height);
        $("#projInfoModalDialog").find("#typeSelect").val(selected[0].type);
        $("#projInfoModalDialog").modal('show');
    }
}

function isProjectInfoStored(projectInfo) {
    if (projectInfo.is_stored == false) {
        showMessageBox("无法修改已出库数据,请选择在库数据.");
        selected = [];
        selectionIds = [];
        return false;
    }
    return true;
}

function emptyProjectInfoModel() {
    $(".projInfoInput").each(function (index, element) {
        if ($(element).attr("id") != "typeSelect") {
            $(this).val("");
        }
    })
}

function modifyInsertBtnAndUploadBtnStatus(bEnable) {
    if (document.getElementById("insertBtn") != null
        && document.getElementById("uploadBtn")) {
        var insertBtn = $("#insertBtn");
        var uploadBtn = $("#uploadBtn");
        insertBtn.attr("disabled", !bEnable);
        uploadBtn.attr("disabled", !bEnable);
    }
}
