/**
* The recursive tree item used in the hierarchical/tree selector control
*/
angular.module('hierarchical-selector.tree-item', [
  'hierarchical-selector.selectorUtils'
])
.directive('treeItem', ['$compile', '$q', 'selectorUtils', function($compile, $q, selectorUtils) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'tree-item.tpl.html',
    scope: {
      item: '=',
      itemSelected: '&',
      onActiveItem: '&',
      multiSelect: '=?',
      isActive: '=', // the item is active - means it is highlighted but not selected
      selectOnlyLeafs: '=?',
      useCanSelectItem: '=',
      canSelectItem: '=', // reference from the parent control
      loadChildItems: '=', // reference from parent
      itemHasChildren: '&',
      async: '=',
      asyncChildCache: '='
    },
    controller: ['$scope', function($scope) {
      $scope.metaData = selectorUtils.getMetaData($scope.item);
      $scope.metaData.isExpanded = false;

      $scope.theChildren = $scope.item.children;

      $scope.showExpando = function(item) {
        return selectorUtils.hasChildren(item, $scope.async);
      };

      $scope.onExpandoClicked = function(item, $event) {
        $event.stopPropagation();
        var meta = selectorUtils.getMetaData(item);
        meta.isExpanded = !meta.isExpanded;
      };

      $scope.clickSelectItem = function(item, $event) {
        $event.stopPropagation();
        if ($scope.itemSelected) {
          $scope.itemSelected({item: item});
        }
      };

      $scope.subItemSelected = function(item, $event) {
        if ($scope.itemSelected) {
          $scope.itemSelected({item: item});
        }
      };

      $scope.activeSubItem = function(item, $event) {
        if ($scope.onActiveItem) {
          $scope.onActiveItem({item: item});
        }
      };

      $scope.onMouseOver = function($event) {
        $event.stopPropagation();
        if (angular.isFunction($scope.onActiveItem)) {
          $scope.onActiveItem({item: $scope.item});
        }
      };

      $scope.showCheckbox = function() {
        if (!$scope.multiSelect) {
          return false;
        }
        // it is multi select
        // canSelectItem callback takes preference
        if ($scope.useCanSelectItem) {
          return $scope.canSelectItem({item: $scope.item});
        }
        return !$scope.selectOnlyLeafs || ($scope.selectOnlyLeafs && !selectorUtils.hasChildren($scope.item, $scope.async));
      };
    }],
    /**
    * Manually compiles the element, fixing the recursion loop.
    * @param element
    * @param [link] A post-link function, or an object with function(s) registered via pre and post properties.
    * @returns An object containing the linking functions.
    */
    compile: function(element, attrs, link) {
      // Normalize the link parameter
      if(angular.isFunction(link)) {
        link = { post: link };
      }

      // Break the recursion loop by removing the contents
      var contents = element.contents().remove();
      var compiledContents;
      return {
        pre: (link && link.pre) ? link.pre : null,
        /**
        * Compiles and re-adds the contents
        */
        post: function(scope, element, attrs){
          // Compile the contents
          if(!compiledContents){
            compiledContents = $compile(contents);
          }
          // Re-add the compiled contents to the element
          compiledContents(scope, function(clone){
            element.append(clone);
          });

          // Call the post-linking function, if any
          if (link && link.post) {
            link.post.apply(null, arguments);
          }

          // when someone expands a node fetch data if needed
          if (scope.async) {
            scope.$watch('item.' + selectorUtils.getMetaPath() + '.isExpanded', function(newVal) {
              if (!newVal) {
                return;
              }
              if (scope.asyncChildCache[scope.item.$$hashKey]) {
                return scope.asyncChildCache[scope.item.$$hashKey];
              }

              scope.theChildren = [{placeholder: true}];
              if (angular.isFunction(scope.loadChildItems) && scope.item) {
                var items = scope.loadChildItems({parent: scope.item});
                if (angular.isArray(items)) {
                  scope.theChildren = items;
                }
                items.then(function(data) {
                  scope.theChildren = data;
                  // cache the children
                  scope.asyncChildCache[scope.item.$$hashKey] = data;
                });
              }
            });
          }
        }
      };
    }
  };
}])
;
