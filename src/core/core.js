/**
 * Project: GameEngine.
 * @copyright (c) 2013, Eugene-Krevenets
 */

var List = require('./../utils/list');
var isArray = require('./../utils/utils').isArray;
var isDefined = require('./../utils/utils').isDefined;
var isString = require('./../utils/utils').isString;
var isUndefined = require('./../utils/utils').isUndefined;
var utils = require('./../utils/utils');
var Module = require('./module');
var World = require('./world');


/**
 * @class darlingjs
 * @classdesc
 *
 * The static facade of darlinjg engine.
 * Uses for creating modules and game world.
 */
var darlingjs = {};
darlingjs.version = '0.0.0';

var worlds = {};

var modules = {};

darlingjs.List = List;

/**
 * Create new Module
 * m is short form of function module
 * @example
 *<pre>
 var m = darlingjs.module('theModule');
 *</pre>
 * @param {String} name The name of new module
 * @param {Array} [deps] The array of modules that new module it depends on
 * @return {Module}
 */
darlingjs.m = darlingjs.module = function (name, deps) {
  if (isDefined(modules[name])) {
    throw new Error('Module "' + name + '" has already been defined.');
  }
  var moduleInstance = new Module();
  moduleInstance.$name = name;
  moduleInstance.requires = deps;

  modules[name] = moduleInstance;

  return moduleInstance;
};

/**
 * Build World. Like a Module in AngularJS.
 * w is short form of function world
 * @example
 *<pre>
 var world = darlingjs.world('theWorld', [
 'ngPhysics',
 'ngBox2DEmscripten',
 'ngFlatland',
 'ngPixijsAdapter']);
 *</pre>
 * @param {String} name The name of new World
 * @param {Array} requires The array of requires modules
 *
 * @return {World} The new World;
 */
darlingjs.w = darlingjs.world = function (name, deps) {
  if (isDefined(worlds[name])) {
    throw new Error('World "' + name + '" has already been defined.');
  }

  var worldInstance = new World();
  worldInstance.$name = name;
  worlds[name] = worldInstance;

  if (isArray(deps)) {
    for (var index = 0, count = deps.length; index < count; index++) {
      var moduleName = deps[index];
      var moduleInstance = modules[moduleName];
      if (isUndefined(moduleInstance)) {
        throw new Error('Can\'t find module: "' + moduleName + '"');
      }

      worldInstance.$$injectedModules[moduleName] = moduleInstance;

      var components = moduleInstance.$$components;
      for (var componentName in components) {
        if (components.hasOwnProperty(componentName)) {
          var component = moduleInstance.$$components[componentName];
          if (isUndefined(component)) {
            throw new Error('Module: "' + moduleName + '" has null component with name "' + componentName + '".');
          }

          worldInstance.$$injectedComponents[component.$name] = component;
        }
      }

      var systems = moduleInstance.$$systems;
      for (var systemName in systems) {
        if (systems.hasOwnProperty(systemName)) {
          var system = systems[systemName];
          if (isUndefined(system)) {
            throw new Error('Module: "' + moduleName + '" has null system with name "' + systemName + '".');
          }

          worldInstance.$$injectedSystems[system.$name] = system;
        }
      }
    }
  }

  return worldInstance;
};

/**
 * Remove module from engine by name
 *
 * @param {String} name The name of module
 */
darlingjs.removeModule = function (name) {
  delete modules[name];
};

/**
 * Remove all modules from engine
 */
darlingjs.removeAllModules = function () {
  modules = {};
};


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

darlingjs.utils = utils;

module.exports = darlingjs;
