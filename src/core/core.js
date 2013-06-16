/**
 * Project: GameEngine.
 * @copyright (c) 2013, Eugene-Krevenets
 */

/**
 * Previous instance of facade of darlingjs engine
 *
 * @ignore
 * @type {darlingjs}
 * @private
 */
var _darlingjs = window.darlingjs;

/**
 * @class darlingjs
 * @classdesc
 *
 * The static facade of darlinjg engine.
 * Uses for creating modules and game world.
 */
var darlingjs = window.darlingjs || (window.darlingjs = {});
darlingjs.version = '0.0.0';

var worlds = {};

var modules = {};

/**
 * Restores the previous global value of darlingjs and returns the current instance. Other libraries may already use the
 * darlingjs namespace. Or a previous version of darlingjs is already loaded on the page. In these cases you may want to
 * restore the previous namespace and keep a reference to darlingjs.
 *
 * @return {darlingjs} The current darlingjs namespace
 */
darlingjs.noConflict = function() {
    var a = window.darlingjs;
    window.darlingjs = _darlingjs;
    return a;
};

/**
 * Create new Module
 * m is short form of function module
 * @example
 *<pre>
 var m = darlingjs.module('theModule');
 *</pre>
 * @param {String} name The name of new module
 * @param {Array} [requires] The array of modules that new module it depends on
 * @return {Module}
 */
darlingjs.m = darlingjs.module = function(name, requires) {
    if (isDefined(modules[name])) {
        throw new Error('Module "' + name + '" has already been defined.');
    }
    var moduleInstance = new Module();
    moduleInstance.$name = name;
    moduleInstance.requires = requires;

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
darlingjs.w = darlingjs.world = function(name, requires) {
    if (isDefined(worlds[name])) {
        throw new Error('World "' + name + '" has already been defined.');
    }

    var worldInstance = new World();
    worldInstance.$name = name;
    worlds[name] = worldInstance;

    if (isArray(requires)) {
        for (var index = 0, count = requires.length; index < count; index++) {
            var moduleName = requires[index];
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
darlingjs.removeModule = function(name) {
    delete modules[name];
};

/**
 * Remove all modules from engine
 */
darlingjs.removeAllModules = function() {
    modules = {};
};


/**
 * Remove world
 *
 * @param {String/World} value The name or instance of world to remove
 */
darlingjs.removeWorld = function(value) {
    var worldName;
    if (isString(value)) {
        worldName = value;
    } else {
        for(var name in worlds) {
            if(worlds[name] === value) {
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
darlingjs.removeAllWorlds = function() {
    worlds = {};
};


