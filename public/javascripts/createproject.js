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
            alert("创建成功");
            $("#project-name").val("");
       }
    })
}