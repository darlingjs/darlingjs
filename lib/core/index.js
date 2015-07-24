/**
 * Project: GameEngine.
 * @copyright (c) 2013, Eugene-Krevenets
 */

var components = require('./components');
var List = require('./../utils/list');
var Pipeline = require('./pipeline');
var utils = require('./../utils/utils');
var copy = utils.copy;
var World = require('./world');

/**
 * @class darlingjs
 * @classdesc
 *
 * The static facade of darlingjs engine.
 * Uses for creating modules and game world.
 */
var darlingjs = {};
darlingjs.version = '0.0.0';

var uniqIDValue = 0;
function uniqID() {
  return uniqIDValue++;
}

darlingjs.c = darlingjs.component = components;

/**
 * create new constructor of system
 *
 * @returns {Object}
 */
darlingjs.system = function(config) {
  return function(ops) {
    if (config) {
      config.state = ops;
    }
    return copy(config, {});
  };
};

/**
 * Build World. Like a Module in AngularJS.
 * w is short form of function world
 * @example
 *<pre>
 var world = darlingjs.world('theWorld');
 *</pre>
 * @param {String} (name) The name of new World
 *
 * @return {World} The new World;
 */
darlingjs.w = darlingjs.world = function (name) {
  if (!name) {
    name = 'world_' + uniqID();
  }

  var world = new World();
  world.name = name;

  return new Pipeline(world);
};

darlingjs.List = List;
darlingjs.recipe = {
  sequence: require('./recipes/sequence')
};
darlingjs.utils = utils;


module.exports = darlingjs;
