/**
 * Project: GameEngine.
 * @copyright (c) 2013, Eugene-Krevenets
 */

var List = require('./../utils/list');
var isDefined = require('./../utils/utils').isDefined;
var isString = require('./../utils/utils').isString;
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

/**
 * create new constructor of system
 *
 * @returns {Object}
 */
darlingjs.system = function(config) {
  return function() {
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
darlingjs.utils = utils;

module.exports = darlingjs;
