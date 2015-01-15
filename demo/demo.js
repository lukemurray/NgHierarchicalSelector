angular.module('demo', ['hierarchical-selector'])

.controller('DemoCtrl', function($scope, $http, $q) {
  $scope.data1 = [];

  for (var i = 0; i < 7; i++) {
    var obj = {
      id: i,
      name: 'Node ' + i,
      children: []
    };

    for (var j = 0; j < 3; j++) {
      var obj2 = {
        id: i + '.' + j,
        name: 'Node ' + i + '.' + j,
        children: [],
		parents: [i]
      };
      obj.children.push(obj2);
    }

    $scope.data1.push(obj);
  }

  $scope.data1[1].children[0].children.push({
    id: '1.0.1',
    name: 'Node sub_sub 1',
    children: [],
	parents: [1, '1.1']
  });

  $scope.data2 = angular.copy($scope.data1);
  $scope.data3 = angular.copy($scope.data1);
  $scope.data4 = angular.copy($scope.data1);
  $scope.data5 = angular.copy($scope.data1);
  $scope.data6 = angular.copy($scope.data5);
  
  $scope.copySelection = function copySelection(items) {
	return angular.copy(items);
  }

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
