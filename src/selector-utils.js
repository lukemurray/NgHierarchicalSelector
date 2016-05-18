/**
* Service contianing shared fuctions between the two directives
*/
angular.module('hierarchical-selector.selectorUtils', [])
.factory('selectorUtils', ['$q', function($q) {
  return {
    getMetaPath: function() {
      return '_hsmeta'; // change below if you change this
    },

    getMetaData: function(item) {
      // we store some meta data on the object - maybe we shouldn't but it is easy now
      // they should be passing us a 'view-model' anyway as we require a few fields (children, name, hasChildren)
      if (!item._hsmeta) {
        item._hsmeta = {};
      }
      return item._hsmeta;
    },

    hasChildren: function(item, async) {
      return async ? item.hasChildren : item.children && item.children.length > 0;
    },

    getChildren: function(item, async, cache) {
      var children = async ? cache[item.$$hashKey] : item.children;
      if (async && !children && item.hasChildren) {
        // we haven't loaded them yet. Return palceholder
        return [];
      }
      return children;
    }
  };
}])
;
