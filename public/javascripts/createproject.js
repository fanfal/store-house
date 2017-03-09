/*global $ */
var alertToolTip = $("#topAlert");

function showToolTip(msg, bSuc){
    alertToolTip.css("display","block");
    if(bSuc){
        alertToolTip.addClass("alert-success");
    }
    else{
        alertToolTip.addClass("alert-danger");
    }
    alertToolTip.addClass("alert-show");
    alertToolTip.html(msg);
    var timer = setInterval(function () {
        clearInterval(timer);
        alertToolTip.removeClass("alert-show");
        alertToolTip.removeClass("alert-success");
        alertToolTip.removeClass("alert-danger");
        alertToolTip.addClass("alert-show");
        alertToolTip.css("display","none");
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
       url : "http://localhost:8080/insertData/project",
       data : {"project_name": $("#project-name").val()},
       dataType : 'json',
       success : function (data) {
            showToolTip("创建成功", true);
       },
       error : function (data){
            var errMsg = JSON.stringify(data.responseJSON.message);
            if (errMsg == '"project name has exist."'){
               showToolTip("已有同名工程存在");
            }
       }
    })
}