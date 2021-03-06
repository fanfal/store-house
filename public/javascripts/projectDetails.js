/*global $*/

const c_selOperating = "selOperating";
const c_selOperable = "selOperatable";
const c_selExhausted = "selExhausted";
const c_selAll = "selAll";
const FILTER_TYPE_COUNT = 6;

var inputList = new Array;
var selectionIds = [];
var selected = [];
var app = angular.module("projectDetails", []);
var $myScope = null;
var isInsertProjectInfoModel = true;

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
    this.projectDetailsStateMachine = new projectDetailsStateMachine()
    this.pageNumber = 1;
    this.mainContainer = $("#Container");
    this.table = new bootStrapTable($("#bootstrapTable"), this);
    this.insertBtn = $("#insertBtn");   //添加按钮
    this.operatingProject = "";        //现在正在操作的工程表
    this.selectors = {
        projectTypeSelect: $("#projectTypeSelect"),
        projectListSelect: $("#projectListSelect"),
    }
    this.projTypeOptions = {
        selOperating: $("option[value = 'selOperating']"),
        selOperatable: $("option[value = 'selOperatable']"),
        selExhausted: $("option[value = 'selExhausted']"),
        selAll: $("option[value = 'selAll']")
    }

    /////////////////////////////////////////成员函数/////////////////////////////////////////
    //往工程下拉列表中追加选项
    this.appendOptionsToProjectPickList = function (projNamePickList) {
        this.selectors.projectListSelect.empty();
        if (projNamePickList.length == 0) {
            $("#bootstrapTable").bootstrapTable('removeAll');
            //工程列表是空的，禁止插入
            projDetailsModelInstance.projectDetailsStateMachine.enableInsert(false);
        }
        else {
            for (item in projNamePickList) {
                var option = "<option value = '" + projNamePickList[item] + "'>" + projNamePickList[item] + "</option>";
                this.selectors.projectListSelect.append(option);
            }
            projDetailsModelInstance.projectDetailsStateMachine.enableInsert(true);
        }

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
            cache: false,
            pagination: true,
            queryParams: model.getQueryParams,
            sidePagination: "server",
            pageNumber: model.pageNumber,
            pageSize: 10,
            pageList: [10, 20, 30],
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
    this.projectTypeSelectChanged = function () {
        function requestForProjectList(status) {
            var getURL = "";
            if (status == projectType.ALL) {
                getURL = c_getProjectsURL;
            }
            else {
                getURL = c_getProjectsURL + "?status=" + status;
            }
            var array = new Array;
            $.ajax({
                url: getURL,
                type: "GET",
                async: false,
                success: function (data) {
                    var list = data.project_list;
                    for (var i = 0; i < list.length; ++i) {
                        array.push(list[i].project_name);
                    }
                },
                error: function () {
                    alert("拉取工程信息时发生错误，请刷新页面或联系管理员。")
                }
            })
            return array;
        }

        model.selectors.projectListSelect.unbind('change');
        var selectType = -1;
        //往projectListSelect中添加选项, 然后默认选第一个
        var selection = model.selectors.projectTypeSelect.val();
        if (selection == c_selOperating) {
            selectType = projectType.OPERATING;
        }
        else if (selection == c_selOperable) {

            selectType = projectType.OPERABLE;
        }
        else if (selection == c_selExhausted) {
            selectType = projectType.EXHAUSTED;
        }
        else {
            selectType = projectType.ALL;
        }
        var projects = requestForProjectList(selectType);
        model.appendOptionsToProjectPickList(projects);
        model.selectors.projectListSelect.change(model.projectListSelectChanged);
        if (projects.length > 0) {
            var first = $("#projectListSelect option:first")
            first.attr("selected", true);
            $("#s2id_projectListSelect a .select2-chosen").html(first.html());
            model.projectListSelectChanged();
        }
        else {
            $("#s2id_projectListSelect a .select2-chosen").html("&nbsp;");
        }
        projDetailsModelInstance.projectDetailsStateMachine.setSelectedProjectType(selectType);
    }

    //工程名称下拉列表变化
    this.projectListSelectChanged = function () {
        selectionIds = [];
        selected = [];
        model.projectDetailsStateMachine.enableExport(false);
        $myScope.update(selected);
        //1. 拿到选中的选项
        model.additionalQueryParams = {};
        model.operatingProject = model.selectors.projectListSelect.find("option:selected").text();
        model.table.pullData(model.getOption(model));
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
        //2. 绑定下拉列表变化事件
        this.selectors.projectTypeSelect.change(this.projectTypeSelectChanged);
        this.selectors.projectListSelect.change(this.projectListSelectChanged);
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
    }

    this.onInsertSuc = function () {
        //插入成功，可能需要调整下拉列表状态
        var state = this.projectDetailsStateMachine.insertDone();
        state.exec(this);
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

function isProjectInfoSelected() {
    if (selected.length == 0) {
        showMessageBox("请勾选要导出的项.");
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
    if (isProjectInfoSelected() && isProjectSelected()) {
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
            inputList[errInputIndex].control.tooltip('show');
            var timer = setInterval(function () {
                inputList[errInputIndex].control.tooltip('hide');
                inputList[errInputIndex].control.tooltip('destroy');
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

function onCancel() {
    $("#projInfoModalDialog").modal('hide');
}

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
    if (!isProjectInfoSelected()) {
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
    var searchingProjectName = $("#projectListSelect").val()
    if (searchingProjectName == null ||
        searchingProjectName == "") {
        showMessageBox("请先选择项目");
    } else {
        var selectorArray = new Array;
        selectorArray.push($("#query-buildingSelect"));
        selectorArray.push($("#query-unitSelect"));
        selectorArray.push($("#query-floorSelect"));
        selectorArray.push($("#query-numberSelect"));
        selectorArray.push($("#query-positionSelect"));
        selectorArray.push($("#query-typeSelect"));
        var queryAdditionalCondition = {};

        function searchConditionCheck() {
            var emptyConditionCount = 0;
            selectorArray.forEach(function (selector, index) {
                var selection = selector.val();
                if (selection == null || selection == "") {
                    ++emptyConditionCount;
                }
                else {
                    queryAdditionalCondition[selector.attr("queryKey")] = selector.val();
                }
            });
            return emptyConditionCount != FILTER_TYPE_COUNT;
        }

        if (searchConditionCheck()) {
            querySearchFilterData(queryAdditionalCondition)
        }
        else {
            showMessageBox("搜索条件不能为空!");
        }
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

function onAccurateSearchClicked() {
    var searchingProjectName = $("#projectListSelect").val();
    if (searchingProjectName == null ||
        searchingProjectName == "") {
        showMessageBox("请先选择项目");
    }
    else {
        $("#searchFilter").modal('show');
        getSearchFilterValue($("#query-buildingSelect"), searchingProjectName, "building")
        getSearchFilterValue($("#query-unitSelect"), searchingProjectName, "unit")
        getSearchFilterValue($("#query-floorSelect"), searchingProjectName, "floor")
        getSearchFilterValue($("#query-numberSelect"), searchingProjectName, "number")
        getSearchFilterValue($("#query-positionSelect"), searchingProjectName, "position")
    }
}

function onUpdate() {
    if (isProjectInfoSelected() && isOnlyOneProjectInfoSelect()) {
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


function emptyProjectInfoModel() {
    $(".projInfoInput").each(function (index, element) {
        if ($(element).attr("id") != "typeSelect") {
            $(this).val("");
        }
    })
}
