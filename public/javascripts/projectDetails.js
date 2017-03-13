/*global $*/
var pageOperationType = {
    potcheckAndInsert : 1,  //查看和添加
    potOutGoing : 2,       //出库
    potStastics : 3,       //统计查询
}
function projectDetailsModal () {
    this.mainContainer = $("#Container");
    this.pageOperationType = parseInt(parent.getUsage());  //页功能类型
    this.GridManager = $("table[grid-manager]"); //表格控件
    this.insertBtn = $("#insertBtn");   //添加按钮
    this.operationgProject = "";        //现在正在操作的工程表
    this.projectNameCluster = {     //分类好的工程名称
        operatingProjects : [],
        operatableProjects : [],
        exhaustedProjects : [],
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

    //函数
    //往工程下拉列表中追加选项
    this.appendOptionsToProjectPickList = function(projNamePickList){
        this.selectors.projectListSelect.empty();
        for(item in projNamePickList) {
            var option = "<option value = '" + projNamePickList[item] + "' >" + projNamePickList[item]  + "</option>";
            this.selectors.projectListSelect.append(option);
        }
    }

    //工程类别下拉列表变化
    var modal = this;
    this.projectTypeSelectChanged = function () {
            //往projectListSelect中添加选项, 然后默认选第一个
            var selection = modal.selectors.projectTypeSelect.val();
            if (selection == 'selOperating'){
                modal.appendOptionsToProjectPickList( modal.projectNameCluster.operatingProjects);
            }
            else if(selection == 'selOperatable'){
                modal.appendOptionsToProjectPickList(modal.projectNameCluster.operatableProjects);
            }
            else if(selection == 'selExhausted'){
                modal.appendOptionsToProjectPickList( modal.projectNameCluster.exhaustedProjects);
            }
            else{
                var tmpList = modal.projectNameCluster.operatingProjects;
                tmpList = tmpList.concat(modal.projectNameCluster.operatableProjects);
                tmpList = tmpList.concat(modal.projectNameCluster.exhaustedProjects);
                modal.appendOptionsToProjectPickList(tmpList);
            }
    }

    //工程名称下拉列表变化
    this.projectListSlectChanged = function () {


    }
    this.generateColumnData = function () {
        var columnData = [
        { key: 'building',
          remind: '栋号',
          text: '栋',
          width : '50px',
         },{
          key: 'unit',
          remind: '单元号',
          text: '单元',
          width : '50px',
         },{
          key: 'floor',
          remind: '楼号' ,
          width : '50px',
          text: '楼'
         },{
          key: 'number',
          remind: '号',
          width: '50',
          text: '号'
        },{
          key: 'position',
          remind: '洞',
        　width: '100px',
          text: '洞'
        },{
          key: 'type',
          remind: '类型',
          width: '50px',
          text: '类型'
        },{
          key: 'width',
          remind: '宽度',
          width: '50px',
          text: '宽度'
        },{
          key: 'height',
          remind: '高度',
          width: '50px',
          text: '高度'
         }];
         if(this.pageOperationType == pageOperationType.potStastics){
            columnData.push({
                key : 'is_unStored',
                remind : '是否出库',
                width : '30px',
                text : '是否出库'
            })
         }
        return columnData;
    }

    //初始化表格
    this.initGrid = function () {
        this.GridManager.GM({
            disableCache: true          //禁用本地缓存
            ,i18n:'zh-cn'               //支持中文
            ,supportCheckbox: true      //全选反选
            ,supportRemind: true        //提示
            ,supportAjaxPage:true       //分页渲染
            ,isCombSorting: false       //排序
            ,pageSize : 20              //每页多少条
            ,height : ['100px']
            ,width : ['100%']
            ,ajax_url : "http://localhost:8080/get-data/project-info"
            ,ajax_type : 'POST'
            ,query : {}
            ,columnData : this.generateColumnData()
        });
    }


    //根据类型分类工程
    this.doCluster = function(data) {
        var projectList = data.project_list;
        for(var i = 0 ; i < projectList.length; i++) {
            var item = projectList[i];
            if(item.operation_status == 0) {
                this.projectNameCluster.operatableProjects.push(item.project_name);
            }
            else if(item.operation_status == 1) {
                this.projectNameCluster.selOperating.push(item.project_name);
            }
            else{
                this.projectNameCluster.exhaustedProjects.push(item.project_name);
            }
        }
    }

    //生成ajax请求的url
    this.generateAjaxUrl = function() {
        var url = "http://localhost:8080/get-data/projects" //这里需求有点不明确，暂定为所有的工程都可以拿来
        return url;
    }

    //拉取工程列表
    this.pullProjectList = function() {
          var modal = this;
          function ajax_suc(data) {
                modal.mainContainer.css("display", "");
                modal.doCluster(data);
                //1. 默认选中 "全部"
                modal.projTypeOptions.selAll.attr("selected", true);
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
         if(this.pageOperationType != 1){
                this.selectors.projectTypeSelect.css("display", "hide"); //如果不是查看和添加页面，隐藏这个下拉列表
         }
         else{
            this.insertBtn.css("display", "none");
         }
         //2. 绑定下拉列表变化事件
        this.selectors.projectTypeSelect.change(this.projectTypeSelectChanged);
        this.selectors.projectListSelect.change(this.projectListSlectChanged);

        //3. 初始化表格
        this.initGrid();

         //4. 获取工程列表
        this.pullProjectList();
    }
}


$(document).ready(function () {
    $("select").select2({dropdownCssClass:'select-inverse-dropdown'});
    parent.setUsage(1);
    var projDetailsModal = new projectDetailsModal();
    //初始化模型
    projDetailsModal.Init();

})