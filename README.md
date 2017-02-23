# store-house

*Push 方式* : git push origin master.

*DB migrate document* : https://github.com/rsandor/node-migrate

*URL:* getProjects: http://localhost:8080/projectData/projects
       getProject: http://localhost:8080/projectData/project?name=
       getProjectInfo: http://localhost:8080/projectData/projectInfo?name=

*数据插API格式*  项目信息插入api Jason模式
                {
                   project_info: [
                    {
                     project_name: "test",
                     type:"窗户"
                    },
                    {
                     project_name: "test",
                     type: "门"
                    }
                 ]
               }

               项目创建格式
                {
                  project_name: "test"
                }

其中project_name不能为空,服务器会检测,如果为空,则插入错误,返回错误代码. 当project_name 有字段时就创建pro