/*global $ */

function Card(cardName, createdTime, updatedTime) {
    this._cardName = cardName;
    this._cTime = createdTime;
    this._uTime = updatedTime;

    this.generateDivContent = function generateDivContent() {
        var img = "<img src = '" + this.ImagePath + "' class = 'card-img'>"
        var divInfoBegin = "<div class = 'proj-info'>"
        var h3 = "<h3>" + this._cardName + "</h3>";
        var h4_cTime = "<h4>创建时间:" + this._cTime + "</h4>";
        var h4_uTime = "<h4>更新时间:" + this._uTime + "</h4>";
        var divInfoEnd = "</div>"
        return img + divInfoBegin + h3 + h4_cTime + h4_uTime + divInfoEnd;
    };

    this.generateCardDiv = function generateCardDiv() {
         var divBegin = "<div class = 'card' title = '" + this._cardName + "'>";
         var divContent = this.generateDivContent();
         var divEnd = "</div>";
         return divBegin + divContent + divEnd;
    };



}

Card.prototype.ImagePath = '/images/package.png';



$(document).ready(function () {


     function cardClick(){
           //...
           parent.switchToProjactItemPage($(this).attr("title"));
     }

     function createCard(projName, createDateTime, updateDateTime){
            var card = new Card(projName, createDateTime, updateDateTime);
            return card;
     }


     function sucCallBack(data){
          var projInfoArray = new Array();
          projInfoArray = data.project_list;
          var tableTr = null;
          var rowCount = 0;
          for(var i = 0 ; i < projInfoArray.length; ++i){
                var singleProjInfo = projInfoArray[i];
                var projName = singleProjInfo.project_name;
                var createDateTime = singleProjInfo.created_at;
                var updateDataTime = singleProjInfo.updated_at;
                createDateTime = createDateTime.split('T')[0];
                updateDataTime = updateDataTime.split('T')[0];
                var table = $("#card-table");
                var card = createCard(projName, createDateTime, updateDataTime);
                if (i % 4 == 0)
                {
                    tableTr = $("<tr></tr>");
                    table.append(tableTr);
                    ++rowCount;
                }
                if(tableTr != null)
                {
                    var tableTd = $("<td></td>");
                    var cardDiv = $(card.generateCardDiv());
                    cardDiv.click(cardClick);
                    tableTd.append(cardDiv);
                    tableTr.append(tableTd);
                }
          }

          $("body").css("height", rowCount * 500);
     }

     function errCallBack(data){
            alert("在获取工程信息的时候发生错误.");
     }

     function readProjects() {
            $.ajax({
                url: 'http://localhost:8080/getData/projects',
                type : "GET",
                dataType : 'json',
                success : sucCallBack,
                error : errCallBack
            });
     }

     readProjects();
});