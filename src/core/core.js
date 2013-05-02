'use strict';

/**
 * Module
 * @module core
 */

var _darlingjs = window.darlingjs;
var darlingjs = window.darlingjs || (window.darlingjs = {});
darlingjs.version = '0.0.0';

/**
 * @ngdoc function
 * @name darlingjs.noConflict
 * @function
 *
 * @description
 * Restores the previous global value of darlingjs and returns the current instance. Other libraries may already use the
 * darlingjs namespace. Or a previous version of darlingjs is already loaded on the page. In these cases you may want to
 * restore the previous namespace and keep a reference to darlingjs.
 *
 * @return {Object} The current darlingjs namespace
 */
darlingjs.noConflict = function() {
    var a = window.darlingjs;
    window.darlingjs = _darlingjs;
    return a;
};

var worlds = {};
var modules = {};

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
 * Build World. Like a Module in AngularJS
 *
 * @type {Function}
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
 * @param value
 */
darlingjs.removeModule = function(value) {
    delete modules[value];
};

/**
 * Remove all modules from engine
 */
darlingjs.removeAllModules = function() {
    modules = {};
};


darlingjs.removeWorld = function(value) {
    if (isString(value)) {
        delete worlds[value];
    } else {
        for(var worldName in worlds) {
            if(worlds[worldName] === value) {
                delete worlds[worldName];
                break;
            }
        }
    }
}
/**
 * Remove all worlds from engine
 */
darlingjs.removeAllWorlds = function() {
    worlds = {};
};


