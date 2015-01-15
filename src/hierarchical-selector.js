/**
* Generic hierarchical/tree selection control. It can either have the whole data structure
* or asynchronously load each level.
*
* Allows auto-complete searching of the tree, optional multiple selection
*/
angular.module('hierarchical-selector', [
  'hierarchical-selector.tree-item',
  'hierarchical-selector.selectorUtils'
])
.directive('hierarchicalSelector', function ($compile, selectorUtils) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'hierarchical-selector.tpl.html',
    scope: {
      syncData: '=data',
      multiSelect: '=?',
      onSelectionChanged: '&',
      selectOnlyLeafs: '=?',
      canSelectItem: '&',
      loadChildItems: '&',
      itemHasChildren: '&',
	  selection: '=',
      tagName: '&'
    },
    link: function(scope, element, attrs) {
      // is there a better way to know the callbacks are actually set. So we have make decisions on what to use
      if (attrs.canSelectItem) {
        scope.useCanSelectItemCallback = true;
      }
      if (attrs.loadChildItems) {
        scope.isAsync = true;
      }
      if (attrs.noButton === undefined) {
        scope.showButton = true;
      }
      if (attrs.tagName) {
        scope.useTagName = true;
      }

      // init async
      // if we have no data and have the callback
      if (!scope.syncData && scope.isAsync) {
        scope.data = [];
        var items = scope.loadChildItems({parent: null});
        if (angular.isArray(items)) {
          scope.data = items;
        }
        else {
          items.then(function(data) {
            scope.data = data;
          });
        }
      }

      if (scope.syncData) {
        scope.data = scope.syncData;
        scope.$watch('syncData', function() {
          scope.data = scope.syncData;
        });
      }
    },
    controller: function ($scope, $document, $window, $interpolate) {
      var activeItem;

      $scope.showTree = false;
      $scope.selectedItems = [];
      $scope.multiSelect = $scope.multiSelect || false;
      // we need somewhere to hold the async loaded children to reference them in navigation etc.
      $scope.asyncChildCache = {};

      function docClickHide(e) {
        closePopup();
        $scope.$apply();
      }

      function closePopup() {
        $scope.showTree = false;
        if (activeItem) {
          var itemMeta = selectorUtils.getMetaData(activeItem);
          itemMeta.isActive = false;
          activeItem = undefined;
        }
        // clear cache
        $scope.asyncChildCache = {};
        $document.off('click', docClickHide);
        $document.off('keydown', keyboardNav);
      }

      function findItemOwnerAndParent(item, array, parentArray, parentIndex) {
        if (!array) {
          // we don't know where we are, find the array that we belong to
          return;
        }
        var itemIndex = array.indexOf(item);
        if (itemIndex > -1) {
          return {currentArray: array, parentArray: parentArray, parentIndex: parentIndex, itemIndex: itemIndex };
        }
        var newArray;
        for (var i = 0; i < array.length; i++) {
          if (selectorUtils.hasChildren(array[i], $scope.isAsync)) {
            newArray = findItemOwnerAndParent(item, selectorUtils.getChildren(array[i], $scope.isAsync, $scope.asyncChildCache), array, i);
            if (newArray) {
              break;
            }
          }
        }
        return newArray;
      }

      function findLowestExpandedItem(item) {
        var children = selectorUtils.getChildren(item, $scope.isAsync, $scope.asyncChildCache);
        var c = children[children.length -1];
        if (selectorUtils.getMetaData(c).isExpanded) {
          return findLowestExpandedItem(c);
        }
        return c;
      }

      /*
       * Get the next or previous item from a item in the tree
       */
      function getNextItem(down, item, array) {
        var itemData = findItemOwnerAndParent(item, array);
        var itemMeta = selectorUtils.getMetaData(item);

        if (down) {
          if (itemMeta.isExpanded) {
            // go down the branch
            return selectorUtils.getChildren(item, $scope.isAsync, $scope.asyncChildCache)[0];
          }
          if (itemData.itemIndex < itemData.currentArray.length -1) {
            // next item at this level
            return itemData.currentArray[itemData.itemIndex +1];
          }
          if (itemData.itemIndex == itemData.currentArray.length -1 && itemData.parentArray && itemData.parentIndex < itemData.parentArray.length -1) {
            // Next item up a level
            return itemData.parentArray[itemData.parentIndex +1];
          }
        }
        else {
          if (itemData.itemIndex > 0) {
            // previous item at this level
            var previousAtSameLevel = itemData.currentArray[itemData.itemIndex -1];
            if (selectorUtils.getMetaData(previousAtSameLevel).isExpanded) {
              // find the lowest item
              return findLowestExpandedItem(previousAtSameLevel);
            }
            return previousAtSameLevel;
          }
          if (itemData.itemIndex === 0 && itemData.parentArray) {
            // go to parent
            return itemData.parentArray[itemData.parentIndex];
          }
        }

        return item;
      }

      function changeActiveItem(down) {
        if (!activeItem) {
          // start at the top or bottom
          idx = down ? 0 : $scope.data.length -1;
          $scope.onActiveItem($scope.data[idx]);
        } else {
          $scope.onActiveItem(getNextItem(down, activeItem, $scope.data));
        }
        $scope.$apply();
      }

      // handle keyboard navigation
      function keyboardNav(e) {
        switch (e.keyCode) {
          // backspace
          // case 8: {

            // break;
          // }
          // ESC closes
          case 27: {
            e.preventDefault();
            e.stopPropagation();
            closePopup();
            $scope.$apply();
            break;
          }
          // space/enter - select item
          case 32:
          case 13: {
            e.preventDefault();
            e.stopPropagation();
            if (activeItem) {
              $scope.itemSelected(activeItem);
              $scope.$apply();
            }
            break;
          }
          // down arrow - move down list (next item, child or not)
          case 40: {
            e.preventDefault();
            e.stopPropagation();
            changeActiveItem(true);
            break;
          }
          // up arrow - move up list (previous item, child or not)
          case 38: {
            e.preventDefault();
            e.stopPropagation();
            changeActiveItem(false);
            break;
          }
          // left arrow - colapse node if open
          case 37: {
            e.preventDefault();
            e.stopPropagation();
            if (activeItem) {
              selectorUtils.getMetaData(activeItem).isExpanded = false;
              $scope.$apply();
            }
            break;
          }
          // right arrow - expand node if has children
          case 39: {
            e.preventDefault();
            e.stopPropagation();
            if (activeItem) {
              selectorUtils.getMetaData(activeItem).isExpanded = true;
              $scope.$apply();
            }
            break;
          }
        }
      }

      $scope.onActiveItem = function(item) {
        if (activeItem != item) {
          if (activeItem) {
            var itemMeta = selectorUtils.getMetaData(activeItem);
            itemMeta.isActive = false;
          }
          activeItem = item;
          var itemMeta2 = selectorUtils.getMetaData(activeItem);
          itemMeta2.isActive = true;
        }
      };

      $scope.deselectItem = function(item, $event) {
        $event.stopPropagation();
        $scope.selectedItems.splice($scope.selectedItems.indexOf(item), 1);
        closePopup();
        var itemMeta = selectorUtils.getMetaData(item);
        itemMeta.selected = false;
        if ($scope.onSelectionChanged) {
          $scope.onSelectionChanged({items: $scope.selectedItems.length ? $scope.selectedItems : undefined});
        }
      };

      $scope.onButtonClicked = function($event) {
        if ($scope.showTree) {
          closePopup();
        }
        else {
          $scope.onControlClicked($event);
        }
      };

      $scope.onControlClicked = function($event) {
        $event.stopPropagation();
        if (!$scope.showTree) {
          $scope.showTree = true;

          $document.on('click', docClickHide);
          $document.on('keydown', keyboardNav);
        }
      };

      $scope.itemSelected = function(item) {
        if (($scope.useCanSelectItemCallback && $scope.canSelectItem({item: item}) === false) || ($scope.selectOnlyLeafs && selectorUtils.hasChildren(item, $scope.isAsync))) {
          return;
        }
        var itemMeta = selectorUtils.getMetaData(item);
        if (!$scope.multiSelect) {
          closePopup();
          for (var i = 0; i < $scope.selectedItems.length; i++) {
            selectorUtils.getMetaData($scope.selectedItems[i]).selected = false;
          }

          itemMeta.selected = true;
          $scope.selectedItems = [];
          $scope.selectedItems.push(item);
        } else {
          itemMeta.selected = true;
          var indexOfItem = $scope.selectedItems.indexOf(item);
          if (indexOfItem > -1) {
            itemMeta.selected = false;
            $scope.selectedItems.splice(indexOfItem, 1);
          } else {
            $scope.selectedItems.push(item);
          }
        }

        if ($scope.onSelectionChanged) {
          $scope.onSelectionChanged({items: $scope.selectedItems.length ? $scope.selectedItems : undefined});
        }
      };
  
      $scope.$watch('selection', 
		  function(newValue, oldValue) {
			  if (newValue) {
				if (angular.isArray(newValue)) {
					for (var i = 0; i < newValue.length; i++) {
						$scope.itemSelected(newValue[i]);
					}
				}
				else {
					$scope.itemSelected(newValue);
				}
			  }
		  });
		  
      $scope.getTagName = function(i) {
        if ($scope.useTagName) {
           return $scope.tagName({ item: i });
        }
		return i.name;
      };
    }
  };
})
;
