/*global $ */
var alertToolTip = $("#topAlert");
var timer = null;
function showToolTip(msg, bSuc){
    if(timer != null) clearInterval(timer);

    if(bSuc){
         $("#topAlert").addClass("alert-success");
    }
    else{
        $("#topAlert").addClass("alert-danger");
    }
    $("#topAlert").text(msg);
    $("#topAlert").show();
    $("#topAlert").fadeOut(2000);
    timer = setInterval(function () {
         $("#topAlert").removeClass("alert-danger");
         $("#topAlert").removeClass("alert-success");
         clearInterval(timer);
    }, 3000);
}


function validity(){
   var projectNameEdit = $("#project-name");
   if(projectNameEdit.val() == '')
   {
        showToolTip("工程名称不能为空", false);
        return false;
   }
   return true;
}

$.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [ o[this.name] ];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};


function onClick(){
    if(!validity()) return;
    $.ajax({
       type : "POST",
       url : c_insertProjectURL,
       data : {"project_name": $("#project-name").val()},
       dataType : 'json',
       success : function (data) {
            showToolTip("创建成功", true);
       },
       error : function (data){
            var errMsg = JSON.stringify(data.responseJSON.errorMessage);
            if (errMsg == '"project name has exist."'){
               showToolTip("已有同名工程存在.");
            }
            else{
               showToolTip("创建失败, 未知错误.");
            }
       }
    })
}

function projectsTable(tableElement) {
    this.tableInstance = tableElement;
    this.queryUrl = c_getProjectsURL;
    this.pageNumber = 1;
    this.getColumns = function () {
        var columns = [{
            field : "project_name",
            title : "工程名称",
        }, {
            field: 'created_at',
            title: '创建时间',
            formatter: function (value) {
                var time = value.replace("T", " ");
                return time.replace(".000Z", "");
            }
        }];
        return columns;
    }
    this.getOption = function (rows, columns) {
        var option = {
            data : rows,
            cache: false,
            pagination: true,
            sidePagination: 'client',
            pageNumber: projectsTable.pageNumber,
            pageSize: 5,
            pageList: [5, 10, 15],
            cardView: false,
            detailView: false,
            search: true,
            columns: columns,
            dataType: 'json'
        };
        return option;
    };
    this.create = function (projectsTable) {
        $.ajax({
            url: projectsTable.queryUrl,
            type: "GET",
            async: true,
            success: function (data) {
                var projects = data.project_list;
                projectsTable.tableInstance.bootstrapTable(projectsTable.getOption(projects,
                    projectsTable.getColumns()));
            }
        })
    }
}
$(document).ready(function () {
   projTables = new projectsTable($("#createdProjectTable"));
   projTables.create(projTables);
})