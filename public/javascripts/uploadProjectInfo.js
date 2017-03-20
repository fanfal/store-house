/* global $*/
function onChange(files){
    function getFileName(o){
     var pos=o.lastIndexOf("\\");
     return o.substring(pos+1);
     }
    var fileName = getFileName($("#fileInput").val());
    $("#fileHelp").html(fileName)
}

function onChooseFile(){
    $("#fileInput").click();
}
