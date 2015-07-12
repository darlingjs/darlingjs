/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

'use strict';

var Events = require('./../utils/events');
var List = require('./../utils/list');
var mixin = require('./../utils/utils').mixin;

/**
 * @class System
 * @classdesc
 *
 * System abstract class every system implement it
 *
 * @constructor
 */
var System = function () {
  this.$$init();
};

mixin(System.prototype, Events);

System.prototype.added = null;
System.prototype.addEntity = null;
//Do we really need it?
//System.prototype.beforeUpdate = null;
System.prototype.updateAll = null;
System.prototype.updateOne = null;
//Do we really need it?
//System.prototype.afterUpdate = null;
System.prototype.removeEntity = null;
System.prototype.removed = null;

/**
 * Handlers
 * @ignore
 */
System.prototype.$$updateHandler = null;
System.prototype.$$beforeUpdateHandler = null;
System.prototype.$$afterUpdateHandler = null;
System.prototype.$$addedHandler = null;
System.prototype.$$removedHandler = null;
System.prototype.$$addEntityHandler = null;
System.prototype.$$removeEntityHandler = null;

/**
 * init instance
 * @ignore
 * @private
 */
System.prototype.$$init = function () {
  this.$$setNodes(new List());
};

/**
 * Set entities
 * @ignore
 * @private
 * @param {List} $nodes
 */
System.prototype.$$setNodes = function ($nodes) {
  if (this.$nodes) {
    this.$nodes.off('add');
    this.$nodes.off('remove');
  }

  this.$nodes = $nodes;

  var self = this;

  if (this.$nodes) {
    this.$nodes.on('add', function (node) {
      self.addEntity(node);
    });

    this.$nodes.on('remove', function (node) {
      self.removeEntity(node);
    });
  }
};

/**
 *
 * Build update function that be able to executed for each entity of the System
 *
 * @ignore
 * @private
 * @param handler
 * @param context
 * @return {Function}
 */
System.prototype.$$updateEveryNode = function (handler, context) {
  return function (time) {
    this.$nodes.forEach(handler, context, time);
  };
};

module.exports = System;
