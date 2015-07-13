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

var worlds = {};

var uniqIDValue = 0;
function uniqID() {
  return uniqIDValue++;
}

/**
 * Remove world
 *
 * @param {String/World} value The name or instance of world to remove
 */
darlingjs.removeWorld = function (value) {
  var worldName;
  if (isString(value)) {
    worldName = value;
  } else {
    for (var name in worlds) {
      if (worlds[name] === value) {
        worldName = name;
        break;
      }
    }
  }

  var world = worlds[worldName];
  world.$removeAllSystems();
  world.$stop();

  delete worlds[worldName];
};

/**
 * Remove all worlds from engine
 */
darlingjs.removeAllWorlds = function () {
  worlds = {};
};

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

  if (isDefined(worlds[name])) {
    throw new Error('World "' + name + '" has already been defined.');
  }

  var world = new World();
  world.name = name;
  worlds[name] = world;

  return new Pipeline(world);
};

darlingjs.List = List;
darlingjs.utils = utils;

module.exports = darlingjs;
