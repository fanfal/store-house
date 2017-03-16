/*global $*/


var inputList = new Array;
var selectionIds = [];
var selected = [];

var app = angular.module("projectDetails", []);
var $myScope = null;
app.controller("exportController",
        function ($scope){
        $myScope = $scope;
        $scope.update = function (data) {
              $scope.selected = data;
              $scope.$apply();
        }});

function tolerance () {
    this.widthTolerance = 0.0;
    this.heightTolerance = 0.0;
    this.onConfirm = function () {
        var widthTolerance = parseFloat($("#widthTolerance").val());
        var heightTolerance = parseFloat($("#heightTolerance").val());
        if((widthTolerance != this.widthTolerance) || (heightTolerance != this.heightTolerance)){
             toleranceHandler.widthTolerance = widthTolerance;
             toleranceHandler.heightTolerance = heightTolerance;
             //拉取数据
             projDetailsModelInstance.table.pullData(projDetailsModelInstance.getOption(projDetailsModelInstance));
             //改变内存数据
             for(var i = 0 ; i < selected.length ; ++i){
                var width = parseFloat(selected[i].width);
                var height = parseFloat(selected[i].height);
                width += toleranceHandler.widthTolerance;
                height += toleranceHandler.heightTolerance;
                selected[i].width = width;
                selected[i].height = height;
             }
             $myScope.update(selected);
        }
        $("#projReciverModalDialog").modal('hide');
    }
    this.onCancel = function (){
        $("#projReciverModalDialog").modal('hide');
    }
}
var toleranceHandler = new tolerance();
function initInputList(){
   var id = {name:"product_id", control:$("#productID")};
   var building = {name:"building", control: $("#building")};
   var unit = {name:"unit", control:$("#unit")};
   var floor = {name:"floor", control: $("#floor")};
   var number = {name:"number", control:$("#number")};
   var position = {name:"position", control: $("#position")};
   var type = {name:"type", control:$("#type")};
   var width = {name:"width", control: $("#width")};
   var height = {name:"height", control: $("#height")};
   inputList.push(id);
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

var pageOperationType = {
    potcheckAndInsert : 1,  //查看和添加
    potOutGoing : 2,        //出库
    potStastics : 3,        //统计查询
}

//自己实现一个tableview
function bootStrapTable (bootStrapTableElement, model) {
    this.model = model;
    this.tableInstance = bootStrapTableElement;
    this.pullData = function(option){
        this.tableInstance.bootstrapTable('destroy');
        this.tableInstance.bootstrapTable(option);
    }
}

function projectDetailsModel () {
    /////////////////////////////////////////成员变量/////////////////////////////////////////
    this.pageNumber = 1;
    this.mainContainer = $("#Container");
    this.pageOperationType = parseInt(parent.getUsage());  //页功能类型
    this.table = new bootStrapTable($("#bootstrapTable"), this);
    this.insertBtn = $("#insertBtn");   //添加按钮
    this.operatingProject = "";        //现在正在操作的工程表
    this.projectNameCluster = {         //分类好的工程名称
        operatingProjects : new Array,
        operatableProjects : new Array,
        exhaustedProjects : new Array,
    }
    this.selectors = {
        projectTypeSelect : $("#projectTypeSelect"),
        projectListSelect : $("#projectListSelect"),
    }
    this.projTypeOptions = {
        selOperating : $("option[value = 'selOperating']"),
        selOperatable : $("option[value = 'selOperatable']"),
        selExhausted : $("option[value = 'selExhausted']"),
        selAll : $("option[value = 'selAll']")
    }

    /////////////////////////////////////////成员函数/////////////////////////////////////////
    //往工程下拉列表中追加选项
    this.appendOptionsToProjectPickList = function(projNamePickList){
        this.selectors.projectListSelect.empty();
        if(projNamePickList.length == 0){
            $("#insertBtn").attr("disabled",true);
            $("#bootstrapTable").bootstrapTable('removeAll');
            setExportToExcelBtnEnable(false);
        }
        else{
             for(item in projNamePickList) {
                 var option = "<option value = '" + projNamePickList[item] + "'>" + projNamePickList[item]  + "</option>";
                 this.selectors.projectListSelect.append(option);
             }
              $("#insertBtn").attr("disabled",false);
        }

    }
    
    //根据类型分类工程
    this.doCluster = function(data) {
        var projectList = data.project_list;
        for(var i = 0 ; i < projectList.length; i++) {
            var item = projectList[i];
            if(item.operation_status == projectType.OPERABLE) {
                this.projectNameCluster.operatableProjects.push(item.project_name);
            }
            else if(item.operation_status == projectType.OPERATING) {
                this.projectNameCluster.operatingProjects.push(item.project_name);
            }
            else{
                this.projectNameCluster.exhaustedProjects.push(item.project_name);
            }
        }
    }
        //生成ajax请求的url
    this.generateAjaxUrl = function() {
         return "http://localhost:8080/get-data/projects";
    }

    this.singleSelect = function (id,option) {
        $("#"+id + " option").attr("selected", false);
        option.attr("selected", true);
    }
    this.getOption = function(model) {
        var option = {
             url: "http://localhost:8080/get-data/project-info",
             method: "post",
             responseHandler:responseHandler,
             cache: false,
             pagination: true,
             queryParams: model.getQueryParams,
             sidePagination: "server",
             pageNumber:model.pageNumber,
             pageSize: 10,
             pageList: [10, 20, 30],
             uniqueId: "id",
             cardView: false,
             detailView: false,
             columns: model.getTableColumn(),
             dataType: 'json',
             exportOptions:{
                fileName : this.operatingProject,
                worksheetName : this.operatingProject,
             }
        };
        return option;
    }
    /////////////////////////////////////////事件回调/////////////////////////////////////////////////
        //工程类别下拉列表变化
        var model = this;
        this.projectTypeSelectChanged = function () {
                model.selectors.projectListSelect.unbind('change');
                //往projectListSelect中添加选项, 然后默认选第一个
                var selection = model.selectors.projectTypeSelect.val();
                var list = new Array();
                if (selection == 'selOperating'){
                    list = model.projectNameCluster.operatingProjects
                    model.appendOptionsToProjectPickList(list);
                }
                else if(selection == 'selOperatable'){
                    list = model.projectNameCluster.operatableProjects;
                    model.appendOptionsToProjectPickList(list);
                }
                else if(selection == 'selExhausted'){
                    list = model.projectNameCluster.exhaustedProjects;
                    model.appendOptionsToProjectPickList(list);
                }
                else{
                    list = model.projectNameCluster.operatingProjects;
                    list = list.concat(model.projectNameCluster.operatableProjects);
                    list = list.concat(model.projectNameCluster.exhaustedProjects);
                    model.appendOptionsToProjectPickList(list);
                }
                model.selectors.projectListSelect.change(model.projectListSelectChanged);
                if(list.length > 0){
                     var first = $("#projectListSelect option:first")
                     first.attr("selected", true);
                     $("#s2id_projectListSelect a .select2-chosen").html(first.html());
                     model.projectListSelectChanged();
                }
                else{
                    $("#s2id_projectListSelect a .select2-chosen").html("&nbsp;");
                }
        }

        //工程名称下拉列表变化
        this.projectListSelectChanged = function () {
            selectionIds = [];
            selected = [];
            setExportToExcelBtnEnable(false);
            $myScope.update(selected);
            //1. 拿到选中的选项
            model.operatingProject = model.selectors.projectListSelect.find("option:selected").text();
            model.table.pullData(model.getOption(model));
        }
    /////////////////////////////////////////bootstrapTable用/////////////////////////////////////////


    this.getQueryParams = function (params) {
        if(this.operatingProject != ""){
            params.name = model.operatingProject;
        }
        return params;
    }

    this.getTableColumn = function () {
            var columns = [{title: "全选",
                     field: "select",
                     checkbox: true,
                     width: 20,//宽度
                     align: "center",//水平
                     valign: "middle"//垂直
                     },{
                         field: 'id',
                         title: '序号'
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
                     },  {
                         field: 'type',
                         title: '类型'
                     },  {
                         field: 'width',
                         title: '宽度'
                     }, {
                         field: 'height',
                         title: '高度'
                     }, {
                        field: 'is_stored',
                        title : '是否出库',
                        formatter : function (value, row, index){
                            if(value){
                                return "在库";
                            }
                            else{
                                return "已出库";
                            }
                        }
                     }];
            if(this.pageOperationType != 1){
                 columns.push({field:'is_stored', title:'是否出库'});
            }
            return columns;
    }

    //拉取工程列表
    var projDetailsModel = this;
    this.pullProjectList = function() {
          var model = this;
          function ajax_suc(data) {
                model.mainContainer.css("display", "");
                model.doCluster(data);
                //1. 默认选中 "全部"
                model.singleSelect("projectTypeSelect", model.projTypeOptions.selAll);
                projDetailsModel.projectTypeSelectChanged();
          }

          function ajax_fail(data) {
                alert("在拉取工程信息的时候发生错误, 请联系管理员");
          }

          $.ajax({
               url : this.generateAjaxUrl(),
               type : "GET",
               success : ajax_suc,
               error: ajax_fail
          })
    }

    //初始化
    this.Init = function () {
         //1. 下拉列表 和 按钮
         if(this.pageOperationType != pageOperationType.potcheckAndInsert){
                this.selectors.projectTypeSelect.css("display", "hide"); //如果不是查看和添加页面，隐藏这个下拉列表
         }
         else{
            this.insertBtn.css("display", "show");
         }
         //2. 绑定下拉列表变化事件
        this.selectors.projectTypeSelect.change(this.projectTypeSelectChanged);
        this.selectors.projectListSelect.change(this.projectListSelectChanged);
        //3. 初始化表格
        this.table.pullData(this.getOption(this));
         //选中事件操作数组
         var union = function(array,ids,rows){
             $.each(ids, function (i, id) {
                 if($.inArray(id,array)==-1){
                     array[array.length] = id;
                     selected.push(rows[i]);
                 }
                  });
                 if(array.length > 0){
                    setExportToExcelBtnEnable(true);
                 }
                 return array;
         };
         //取消选中事件操作数组
         var difference = function(array,ids, rows){
                 $.each(ids, function (i, id) {
                      var index = $.inArray(id,array);
                      if(index!=-1){
                          selected.splice(index, 1);
                          array.splice(index, 1);
                      }
                  });
                 if(array.length == 0){
                    setExportToExcelBtnEnable(false);
                 }
                 return array;
         };
         var _ = {"union":union,"difference":difference};
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
}

var projDetailsModelInstance = null;
$(document).ready(function () {
    //$("select").select2({dropdownCssClass:'select-inverse-dropdown'});
    parent.setUsage(1);
    projDetailsModelInstance = new projectDetailsModel();   //数据模型
    //初始化模型
    projDetailsModelInstance.Init();
    initInputList();
})


function onInsert(){
    $("#projInfoModalDialog").modal('show');
}

function onConfirm(){
   function checkValidity(){
        var errInputIndex = -1;
        $(".projInfoInput").each(function(index){
               if($(this).val() == ""){
                    errInputIndex = index;
                    return false;
               }
        })

        if(errInputIndex != -1){
            inputList[errInputIndex].control.tooltip('show');
            var timer = setInterval(function () {
                 inputList[errInputIndex].control.tooltip('hide');
                 inputList[errInputIndex].control.tooltip('destroy');
                 clearInterval(timer);
            }, 3000);
            return false;
        }
        else{
            return true;
        }
   }

   function postToServer(){
        function getData(){
            var res = {};
            res.project_name = projDetailsModelInstance.operatingProject;
            res.is_stored = true;
            for(var i = 0 ; i < inputList.length; ++i){
                res[inputList[i].name] = inputList[i].control.val();
            }
            return res;
        }

        function feedBack(bSuc, msg){
               if(bSuc){
                    $(".alert").addClass("alert-success");
               }
               else{
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
        $.ajax({
            url: "http://localhost:8080/insert-data/projectInfo",
            type : "POST",
            data: getData(),
            dataType : 'json',
            success : function (data){
              $(".projInfoInput").each(function(index){
                          $(this).val("");
                     })
              feedBack(true, "添加成功");
              projDetailsModelInstance.table.pullData(projDetailsModelInstance.getOption(projDetailsModelInstance));
            },
            error : function (data){
                var msg = "添加失败";
                if(data.responseJSON.errorMessage == "Project id has exist."){
                    msg += ", 该编号已存在";
                }
               feedBack(false, msg);
            }
        })
   }
   if(checkValidity()){
        //插入
        postToServer();
   }
}
function responseHandler(res) {
    $.each(res.rows, function (i, row) {
         row.select = $.inArray(row.id, selectionIds) != -1; //判断当前行的数据id是否存在与选中的数组，存在则将多选框状态变为true
         var width = parseFloat(row.width);
         var height = parseFloat(row.height);
         width += toleranceHandler.widthTolerance;
         height += toleranceHandler.heightTolerance;
         row.width = width;
         row.height = height;
    });
    return res;
}

function onCancel(){
    $("#projInfoModalDialog").modal('hide');
}

function onConfirmProjReciver(){
    $("#widthTolerance").val(toleranceHandler.widthTolerance);
    $("#heightTolerance").val(toleranceHandler.heightTolerance);
    $("#projReciverModalDialog").modal('show');
}

function onExport(){
   if($("#exportBtn").attr("disable") == true){return;}
   var option = {
           csvSeparator: ',',
           csvEnclosure: '"',
           consoleLog: false,
           displayTableName: false,
           escape: false,
           excelstyles: [ 'border-bottom', 'border-top', 'border-left', 'border-right' ],
           fileName: projDetailsModelInstance.operatingProject,
           htmlContent: true,
           ignoreColumn: [],
           jspdf: { orientation: 'p',
                    unit:'pt',
                    format:'a4',
                    margins: { left: 20, right: 10, top: 10, bottom: 10 },
                    autotable: { padding: 2,
                                 lineHeight: 12,
                                 fontSize: 8,
                                 tableExport: { onAfterAutotable: null,
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

function setExportToExcelBtnEnable(bEnable){
    if(bEnable){
        $("#exportBtn").attr("disabled", false);
    }
    else{
        $("#exportBtn").attr("disabled", true);
    }

}
