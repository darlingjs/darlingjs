'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

var System = function () {
    this.$nodes = new List();
    this.$$updateHandler = function() {};
};

System.prototype.update = function(timer) {
    this.$$updateHandler.call(this, timer);
};