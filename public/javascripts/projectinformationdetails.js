/*global $ */
String.prototype.format = function(){
    var args = arguments;
    return this.replace(/\{(\d+)\}/g,
        function(m,i){
            return args[i];
        });
}

$(document).ready(function () {
    var projName = parent.getProjectInfoName();
    var usage = parent.getUsage();
    $("#add-btn").click(function () {
        //to do
    })

    function initTable() {
        function reAssemble(json){
             var list = json.project_info_list;
             var count = list.length;
             var resJSON = {"data" : list, "totals" : count};
             return resJSON;
        }

        function ajax_suc(data){
             var table = $("table[grid-manager]");
                    table.GM({
                        disableCache: true
                        ,height: 'auto'
                        ,i18n:'zh-cn'
                        ,supportCheckbox: true
                    	,supportRemind: true
                    	,supportAjaxPage:true
                    	,isCombSorting: false
                    	,pageSize:30
                    	,columnData: [{
                    		key: 'building',
                    		remind: 'the building',
                    		text: '栋',
                    		width : '50px',
                    	},{
                    		key: 'unit',
                    		remind: 'the unit',
                    		text: '单元',
                    		width : '50px',
                    	},{
                    		key: 'floor',
                    		remind: 'the floor',
                    		width : '50px',
                    		text: '楼'
                    	},{
                    		key: 'number',
                    		remind: 'the number',
                    		width: '50',
                    		text: '号'
                    	},{
                    		key: 'position',
                    		remind: 'the position',
                            width: '100px',
                    		text: '洞'
                    	},{
                            key: 'type',
                    		remind: 'the type',
                            width: '50px',
                    		text: '类型'
                    	},{
                            key: 'width',
                            remind: 'the width',
                            width: '80px',
                            text: '宽度'
                        },{
                            key: 'height',
                            remind: 'the height',
                            width: '80px',
                            text: '高度'
                        }
                    	],
                    	ajax_data: reAssemble(data)
                    	,pagingBefore: function(query){
                    		console.log('pagingBefore', query);
                    	}
                    	,pagingAfter: function(data){
                    		console.log('pagingAfter', data);
                    	}
                    });
        }

        $.ajax({
            url : "http://localhost:8080/getData/projectInfo?name=" + projName,
            type : "get",
            dataType : "json",
            success : ajax_suc
        });
    }

    $("#table-head").html(projName);
    //1. 初始化表格
    initTable();
    //2. 获取项目子项
    //getProjectItems();


})