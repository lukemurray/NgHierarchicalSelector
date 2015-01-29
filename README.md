Angular tree-selector directive
=======================================

Hierarchical (or tree) selector for AngularJS. It can either have the whole data structure (a tree) passed to it or set to asynchronously load each level via a callback. It also allows auto-complete searching of the tree, optional multiple selection and keyboard navigation.

### Features
- Select data from a hierarchical/tree structure
- Asynchronously loading of children, or not
- Keyboard navigation

### Check it out
http://lukemurray.github.io/NgNierarchicalSelector/

### Release notes
v0.3.1
  - Added in call back to get the tag name
  - Ability to set the initial selected item.

v0.3
  - Added in feedback about the async children loading
  - Default button to show the tree on the right side of control. Use no-button attribute to hide it

### TODO
- Tests
  - yep, should be writing these
- Docs
  - CSS customisation
- general
  - set up some repeatable way to do a release
  - add to bower
  - set up CI for the project
- tree
  - option for parent select selects all children
- selection
  - A way to customise the text in the select pill
- autocomplete typing
  - allow typing at the end of the selected items
  - auto complete list for typing
  - no typing at the end if item selected and not multi select
  - support async for auto complete
- input control
  - remove selected items by keyboard
- tree
  - disabled items
  - option for no check boxes in multi select?
  - keyboard, left on a chile node should make the parent the active node
- popup
  - better positioning of popup when at bottom/edges etc.

# Requirements
- AngularJS 1.3

## CSS
.expando - Change the expand marker style
.expando-opened - Change the colapse marker style

## ng-required directive

# Contributing
Please do it.

## Building
Gulp is used to build the project ('npm install' will install the gulp dependencies).
- `gulp build` will build is for local development
- `gulp rel-patch` will bump the version and build a release version
- `gulp rel-minor` will bump the version and build a release version
- `gulp watch` with run 'build' and watch for changes

## Testing
