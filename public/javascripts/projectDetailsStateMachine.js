/*global $*/

//状态机, 完成UI状态转换

function noneState() {
    this.exec = function (model) {
        //empty state do nothing
    }
}

function exhaustedToOperableState() {
    this.exec = function (model){
        //从出库完成变成了可以出库
        //也就是说插入了若干记录
        //1. 把当前项目移动到"operable里面"
        var curProjName = model.operatingProject;
        //2. 切换下拉列表
        $("#projectTypeSelect").val("selOperatable");
        //3. 主动激发工程类型下拉列表变化事件
        model.projectTypeSelectChanged();
        //4. 选中刚才切换过来那个
        $("#projectListSelect").val(curProjName);
        //5. 切换到刚才编辑的工程
        model.projectListSelectChanged();
    }
}

function projectDetailsStateMachine(){
    this.insertEnable = false; //插入功能使能
    this.exportEnable = false; //导出功能使能
    this.selectedProjectType = -1;   //当前下拉列表选择的工程类型
    this.isSelectedProjectEmpty = true;         //当前选中的工程是否是一个空工程

//public functions
//insert/export Button status
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
            return new exhaustedToOperableState();
        }
        return new noneState();
    }

}

