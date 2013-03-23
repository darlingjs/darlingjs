'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

var System = function () {
    this.$nodes = new List();
    this.$$updateHandler = function() {};
};

System.prototype.$$updateEveryNode = function(handler, context) {
    return function(time) {
        this.$nodes.forEach(handler, context, time);
    }
};