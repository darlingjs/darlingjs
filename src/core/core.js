'use strict';

/**
 * Module
 * @module core
 */

var darlingjs = window.darlingjs || (window.darlingjs = {});
darlingjs.version = '0.0.0';

var worlds = {};
var modules = {};

darlingjs.m = darlingjs.module = function(name, requires) {
    if (isDefined(modules[name])) {
        throw new Error('Module "' + name + '" has already been defined.');
    }
    var moduleInstance = new Module();
    moduleInstance.name = name;
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
    worldInstance.name = name;
    worlds[name] = worldInstance;

    if (isArray(requires)) {
        for (var index = 0, count = requires.length; index < count; index++) {
            var moduleName = requires[index];
            var module = modules[moduleName];
            if (isUndefined(module)) {
                throw new Error('Can\'t find module: "' + moduleName + '"');
            }

            worldInstance.$$injectedModules[moduleName] = module;

            var components = module.$$components;
            for (var componentName in components) {
                if (components.hasOwnProperty(componentName)) {
                    var component = module.$$components[componentName];
                    if (isUndefined(component)) {
                        throw new Error('Module: "' + this.name + '" has null component with name "' + componentName + '".');
                    }

                    worldInstance.$$injectedComponents[component.name] = component;
                }
            }

            var systems = module.$$systems;
            for (var systemName in systems) {
                if (systems.hasOwnProperty(systemName)) {
                    var system = systems[systemName];
                    if (isUndefined(system)) {
                        throw new Error('Module: "' + this.name + '" has null system with name "' + systemName + '".');
                    }

                    worldInstance.$$injectedSystems[system.name] = system;
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


