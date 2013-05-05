'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 *
 * Use to store lists of entities by collection of components
 *
 * Optimization: User $marker based on used component in family to mark is entity added to Family.
 * We can calculate it in real-time as in addIfMatch, but it's not good for performance.
 */

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
    this.$$marker = null;
}

Family.prototype.$marker = function() {
    if (this.$$marker === null) {
        this.$$marker = '$$family_' + this.componentsString;
        this.nodes.PROPERTY_LINK_TO_NODE =  '$$listNode_of_' + this.$$marker;
    }
    return this.$$marker;
};

Family.prototype.newEntity = function(e) {
    this.addIfMatch(e);
};

Family.prototype.addIfMatch = function(e) {
    if (this.isInList(e)) {
        return;
    }

    for (var i = 0, count = this.components.length; i < count; i++) {
        var componentName = this.components[i];
        if (!e.$has(componentName)) {
            return;
        }
    }

    if (!e.$$familyMarker) {
        e.$$familyMarker = {};
    }

    e.$$familyMarker[this.$marker()] = true;

    this.nodes.add(e);
};

Family.prototype.removeIfMatch = function(e, component) {
    if (isDefined(component) && !this.componentsHash[component.$name] || !this.isInList(e)) {
        return;
    }

    e.$$familyMarker[this.$$marker] = false;
    this.nodes.remove(e);
};

Family.prototype.isInList = function(e) {
    return e.$$familyMarker && e.$$familyMarker[this.$$marker];
};