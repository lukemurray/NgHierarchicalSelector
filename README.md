Angular hierarchical-selector directive
=======================================

Hierarchical (or tree) selector for AngularJS. It can either have the whole data structure (a tree) passed to it or set to asynchronously load each level via a callback. It also allows auto-complete searching of the tree, optional multiple selection and kayboard navigation.

Overview
- Select data from a hierarchical/tree structure
- Asynchronously or not
- Includes auto-complete/type-ahead (configurable to hit your service)

TODO
- bugs
  - can't select item 3 deep with mouse
  - multiselect, lots of tags multi line
- input control
  - remove selected items by keyboard
  - drop-down button for tree selection (configurable)
- extending
  - canSelect callback for custom level of selection
  - disable items
- async
  - support async for expanding
  - support async for auto complete
- autocomplete
  - allow typing at the end of the selected items
  - auto complete list for typing
  - no typing at the end if item selected and not multi select
- Tests
  - yep, should be writing these
- Docs
  - configuration
  - customisation

# Requirements
- AngularJS 1.3

# Usage

## Options

## CSS
.expando - Change the expand marker style
.expando-opened - Change the colapse marker style

## ng-required directive

# Contributing
Do it.

## Building
Gulp is used to build the project.
- `gulp build` will build is for local development
- `gulp release` will bump the version and build a release version
- `gulp watch` with run 'build' and watch for changes

## Testing
