'use strict';

var wrap = require('../utils/wrap');

var Stream = function(world, system) {
  this.world = world;
  this.system = system;
  wrap(world, this);
};

/**
 * put system in a pipe line of the game
 * @param system
 * @returns {Stream}
 */
Stream.prototype.pipe = function(system) {
  return new Stream(this, system);
};

module.exports = Stream;
