/*global $ */
function validity(){
   var projectNameEdit = $("#project-name");
   if(projectNameEdit.val() == '')
   {
        alert("项目名称不能为空");
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
    validity();
    $.ajax({
       type : "POST",
       url : "http://localhost:8080/insertData/project",
       data : {"project_name": $("#project-name").val()},
       dataType : 'json',
       success : function (data) {
            $("#hint").html("创建成功.");
            $("#hint").attr("class", "suchint-show");
            $("#project-name").val("");
            var interval = setInterval(function () {
                $("#hint").attr("class", "suchint-hide");
                clearTimeout(interval);
            }, 3000);

       },
       error : function (data){
            var errMsg = JSON.stringify(data.responseJSON.message);
            if (errMsg == '"project name has exist."'){
                $("#hint").attr("class", "errhint-show");
                $("#hint").html("已有同名工程存在.");
            }
            var interval = setInterval(function () {
                   $("#hint").attr("class", "errhint-hide");
                   clearTimeout(interval);
                   }, 3000);
            $("#project-name").val("");

       }
    })
}