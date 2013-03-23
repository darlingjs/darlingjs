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

function Family() {
    this.components = [];
    this.componentsString = '';
    this.nodes = new List();
}

Family.prototype.$marker = function() {
    if (this.$$marker === null) {
        this.$$marker = '$$family_' + this.componentsString;
    }
    return this.$$marker;
}

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

    e[this.$$marker] = true;

    this.nodes.add(e);
};

Family.prototype.removeIfMatch = function(e) {
    if (!this.isInList(e)) {
        return;
    }

    delete e[this.$$marker];
    this.nodes.remove(e);
};

Family.prototype.isInList = function(e) {
    return e.hasOwnProperty(this.$$marker);
};