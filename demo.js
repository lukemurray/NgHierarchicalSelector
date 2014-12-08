angular.module('demo', ['hierarchical-selector'])

.controller('DemoCtrl', function($scope) {
  $scope.data1 = [];

  for (var i = 0; i < 7; i++) {
    var obj = {
      id: i,
      name: 'Node ' + i,
      children: []
    };

    for (var j = 0; j < 3; j++) {
      var obj2 = {
        id: j,
        name: 'Node ' + i + '.' + j,
        children: []
      };
      obj.children.push(obj2);
    }

    $scope.data1.push(obj);
  }

  $scope.data1[1].children[0].children.push({
    id: j,
    name: 'Node sub_sub 1',
    children: []
  });

  $scope.data2 = angular.copy($scope.data1);
  $scope.data3 = angular.copy($scope.data1);
  $scope.data4 = angular.copy($scope.data1);

  $scope.onSelectionChanged = function(items) {
    var str = '';
    if (items) {
      for (var i = 0; i < items.length; i++) {
        str += items[i].name + ', ';
      }
    }
    return str;
  };

  $scope.selectOnly1Or2 = function(item) {
    if (item)
      return /[12]/.test(item.name);
    return false;
  };
})

;
