'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

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

/**
 * name of the System
 * @type {string}
 */
System.prototype.$name = '';

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
System.prototype.$$init = function() {
    this.$$setNodes(new List());
};

/**
 * Set entities
 * @ignore
 * @private
 * @param {List} $nodes
 */
System.prototype.$$setNodes = function($nodes) {
    if (this.$nodes) {
        this.$nodes.off('add');
        this.$nodes.off('remove');
    }

    this.$nodes = $nodes;

    var self = this;

    if (this.$nodes) {
        this.$nodes.on('add', function(node) {
            self.$$addEntityHandler(node);
        });

        this.$nodes.on('remove', function(node) {
            self.$$removeEntityHandler(node);
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
System.prototype.$$updateEveryNode = function(handler, context) {
    return function(time) {
        this.$nodes.forEach(handler, context, time);
    };
};