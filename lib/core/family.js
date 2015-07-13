/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 *
 * Use to store lists of entities by collection of components
 *
 * Optimization: User marker based on used component in family to mark is entity added to Family.
 * We can calculate it in real-time as in addIfMatch, but it's not good for performance.
 */

'use strict';

var List = require('./../utils/list');
var isDefined = require('./../utils/utils').isDefined;

/**
 * @private
 * @inner
 *
 * Filter for component to apply entity to system by requested components
 *
 * @constructor
 */
function Family() {
  this.components = [];
  this.componentsString = '';
  this.componentsHash = {};
  this.nodes = new List();
  this._marker = null;
}

Family.prototype.marker = function () {
  if (this._marker === null) {
    this._marker = '_family_' + this.componentsString;
    this.nodes.PROPERTY_LINK_TO_NODE = '_listNode_of_' + this._marker;
  }
  return this._marker;
};

Family.prototype.newEntity = function (e) {
  this.addIfMatch(e);
};

Family.prototype.addIfMatch = function (e) {
  if (this.isInList(e)) {
    return;
  }

  for (var i = 0, count = this.components.length; i < count; i++) {
    var componentName = this.components[i];
    if (!e.has(componentName)) {
      return;
    }
  }

  if (!e._familyMarker) {
    e._familyMarker = {};
  }

  e._familyMarker[this.marker()] = true;

  this.nodes.add(e);
};

Family.prototype.removeIfMatch = function (e, component) {
  if (isDefined(component) && !this.componentsHash[component._name] || !this.isInList(e)) {
    return;
  }

  e._familyMarker[this._marker] = false;
  this.nodes.remove(e);
};

Family.prototype.isInList = function (e) {
  return e._familyMarker && e._familyMarker[this._marker];
};

module.exports = Family;
