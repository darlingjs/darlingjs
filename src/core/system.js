'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

var System = function () {
    this._nodes = [];
};

System.prototype.numNodes = function () {
    return this._nodes.length;
};

System.prototype.getNodeByIndex = function (index) {
    if (this._nodes.length <= index) {
        throw new Error('System has only ' + this._nodes.length + ' nodes.');
    }
    return this._nodes[index];
};