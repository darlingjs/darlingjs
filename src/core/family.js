'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 *
 * Use to store lists of entities by collection of components
 */

function Family() {
    this.components = [];
    this.nodes = new List();
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

    this.nodes.add(e);
};

Family.prototype.isInList = function(e) {

};