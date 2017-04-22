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
