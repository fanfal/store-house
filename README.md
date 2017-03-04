# store-house

*Push 方式* : git push origin master.

*DB migrate document* : https://github.com/rsandor/node-migrate

*URL:*
       1.getProjects: http://localhost:8080/projectData/projects (获取所有project 起排列顺整体按照operation_status 升序排列,
        每个status内部按照时间顺序降序排列).

       2.getProjects: http://localhost:8080/projectData/projects?status= (获取单个operation_status的数据,排序按照时间降序排列).

       3.getProject: http://localhost:8080/projectData/project?name=

       4.getProjectInfo: http://localhost:8080/projectData/projectInfo?name=

       5.*数据插API格式*  项目信息插入api url: http://localhost:8080/insertData/projectInfo, url 模式为post,
               header里面要定义为application/type(可查询http请求的header知识),Body包含的插入数据模式为Jason:

                {
                   "project_info": [
                    {
                     "project_name": "test",
                     "building": 1,
                     "unit": 1,
                     "floor": 1,
                     "number": 1,
                     "position": "test",
                     "type":"窗户",
                     "width": 1.1,
                     "height": 1.1,
                     "is_stored": true,
                     "product_id" : "101010111010101" (扫码)
                    },
                    {
                     "project_name": "test",
                     "type": "门"
                    }
                 ]
               }

             6. 项目创建格式api url: http://localhost:8080/insertData/project,剩下同上.
                {
                  "project_name": "test"
                }

            (其中project_name不能为空,服务器会检测,如果为空,则插入错误,返回错误代码. 当project_name 有字段时就创建pro.
            这里发送创建信息的request 都是post, 数据为Json格式, 放在请求的body中.)

            insertData返回格式 "{"success": true/false, "code":"XXXX"}"  code里具体是啥，可以定义