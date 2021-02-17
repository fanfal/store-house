/*global $*/
//状态机, 完成UI状态转换

function syncProjectTypeSelect(selectType) {
    $("#projectTypeSelect").val(selectType);
}

function projectDetailsStateMachine(){
    this.insertEnable = false;        //插入功能使能
    this.exportEnable = false;        //导出功能使能
    this.selectedProjectType = -1;        //当前下拉列表选择的工程类型
    this.isSelectedProjectEmpty = true;   //当前选中的工程是否是一个空工程


    this.enableInsert = function (bValue) {
        this.insertEnable = bValue;
    }

    this.enableExport = function (bValue) {
        this.exportEnable = bValue;
    }

    this.setSelectedProjectType = function(type) {
        this.selectedProjectType = type;
    }

    //state transform
    this.insertDone = function (){
        if(this.selectedProjectType == projectType.EXHAUSTED){
            //如果插入前, 锁定的工程类型是出库完毕，那么插入后，跳转到"可以出库"
            this.selectedProjectType = projectType.OPERABLE;
            syncProjectTypeSelect("selOperable")
        }
    }

    //删除后同步
    this.afterRemove = function (model) {
        if(this.selectedProjectType == projectType.ALL) {return;}
        var modelOperatingProjectName = model.operatingProject;
        //1. 获取这个工程的status, 看是否发生变化了, 这一步必须与后台交互
        var projectStatus = getProjectState(modelOperatingProjectName);
        if (projectStatus != this.selectedProjectType) {
            //工程类型变了
            var strTargetProjectType = "";
            if(projectStatus == projectType.OPERABLE) {
                strTargetProjectType = "selOperable";
            }
            else if(projectStatus == projectType.OPERATING) {
                strTargetProjectType = "selOperating";
            }
            else if(projectStatus == projectType.EXHAUSTED) {
                strTargetProjectType = "selExhausted";
            }
            if(strTargetProjectType != "") {
                syncProjectTypeSelect(strTargetProjectType);
            }
        }
    }

}



