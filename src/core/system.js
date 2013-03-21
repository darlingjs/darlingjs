'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

var System = function () {
    this.$$nodes = [];
};

System.prototype.$numNodes = function () {
    return this.$$nodes.length;
};

System.prototype.$getNodeByIndex = function (index) {
    if (this.$$nodes.length <= index) {
        throw new Error('System has only ' + this.$$nodes.length + ' nodes.');
    }
    return this.$$nodes[index];
};