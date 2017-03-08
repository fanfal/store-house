var app = angular.module('myApp', []);
var array = [];

app.controller('myCtrl', function ($scope, $http) {
    $http.get("http://localhost:8080/getData/projectsName")
        .then(successCallback, errorCallback);

    function successCallback(response) {
        var data = response.data.project_list;
        var array = [];
        for (var i = 0; i < data.length; i++) {
            array.push(data[i].project_name);
        }
        $scope.names = array;
    }

    function errorCallback(error) {
        //error code
    }
});


