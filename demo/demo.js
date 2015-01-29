angular.module('demo', ['hierarchical-selector'])

.controller('DemoCtrl', function($scope, $http, $q) {
  $scope.data1 = [
    {id: 0, name: 'Australia', children: [
      {id: 0, name: 'Melbourne', children: []},
      {id: 0, name: 'Sydney', children: []},
      {id: 0, name: 'Kambalda', children: []}
    ]},
    {id: 1, name: 'Spain', children: [
      {id: 0, name: 'Barcelona', children: []},
      {id: 0, name: 'Madrid', children: []},
      {id: 0, name: 'Benahavis', children: []}
    ]},
    {id: 2, name: 'Peru', children: [
      {id: 0, name: 'Cusco', children: []},
      {id: 0, name: 'Lima', children: []},
      {id: 0, name: 'Huacachina', children: []}
    ]},
    {id: 3, name: 'UK', children: [
      {id: 0, name: 'London', children: []},
      {id: 0, name: 'Leeds', children: []},
      {id: 0, name: 'Manchester', children: []}
    ]},
    {id: 4, name: 'USA', children: [
      {id: 0, name: 'San Francisco', children: []},
      {id: 0, name: 'New York', children: []},
      {id: 0, name: 'San Diego', children: []}
    ]},
    {id: 5, name: 'East Africa', children: [
      {id: 0, name: 'Kenya', children: []},
      {id: 0, name: 'Rwanda', children: []},
      {id: 0, name: 'Tanzania', children: []}
    ]},
    {id: 6, name: 'Japan', children: [
      {id: 0, name: 'Tokyo', children: []},
      {id: 0, name: 'Osaka', children: []},
      {id: 0, name: 'Hiroshima', children: []}
    ]},
    {id: 7, name: 'Germany', children: [
      {id: 0, name: 'Berlin', children: []},
      {id: 0, name: 'Munich', children: []},
      {id: 0, name: 'Frankfurt', children: []}
    ]},
  ];

  $scope.data1[1].children[0].children.push({
    id: 99,
    name: 'Node sub_sub 1',
    children: []
  });
  $scope.data1[1].children[1].children.push({
    id: 100,
    name: 'Node sub_sub 1',
    children: []
  });
  $scope.data1[0].children[0].children.push({
    id: 101,
    name: 'Node sub_sub 1',
    children: []
  });

  $scope.data2 = angular.copy($scope.data1);
  $scope.data3 = angular.copy($scope.data1);
  $scope.data4 = angular.copy($scope.data1);
  $scope.data5 = angular.copy($scope.data1);
  $scope.data6 = angular.copy($scope.data5);

  $scope.onSelectionChanged = function(items) {
    var str = '';
    if (items) {
	  itemNames = [];
      for (var i = 0; i < items.length; i++) {
        itemNames.push(items[i].name);
      }

      str = itemNames.join(', ');
    }
    return str;
  };

  $scope.selectOnly1Or2 = function(item) {
    if (item)
      return /[12]/.test(item.name);
    return false;
  };

  // Needs to return an array of items or a promise that resolves to an array of items.
  $scope.loadAsyncData = function(parent) {
    var defer = $q.defer();
    if (!parent) {
      $http.get('http://jsonplaceholder.typicode.com/users').success(function (data) {
        for (var i = 1; i < data.length -1; i++) {
          data[i].hasChildren = true;
        }
        defer.resolve(data);
      });
    }
    else {
      if (parent.username) {
        // second level
        $http.get('http://jsonplaceholder.typicode.com/users/' + parent.id + '/posts').success(function (data) {
          // make our 'model'
          for (var i = 0; i < data.length; i++) {
            data[i].name = 'Post: ' + data[i].title;
            if (i < 4) {
              data[i].hasChildren = true;
            }
          }
          defer.resolve(data);
        });
      }
      else if (parent.title) {
        // third level
        $http.get('http://jsonplaceholder.typicode.com/posts/' + parent.id + '/comments').success(function (data) {
          // make our 'model'
          for (var i = 0; i < data.length; i++) {
            data[i].name = 'Comment: ' + data[i].name;
          }
          defer.resolve(data);
        });
      }
    }
    return defer.promise;
  };
})

;
