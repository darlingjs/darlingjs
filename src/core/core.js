'use strict';

/**
 * Module
 * @module core
 */

var GameEngine = window.GameEngine || (window.GameEngine = {});

var worlds = {};
var modules = {};

GameEngine.m = GameEngine.module = function(name, requires) {
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
GameEngine.w = GameEngine.world = function(name, requires) {
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
            if (module === null) {
                throw new Error('No module: ' + name);
            }

            worldInstance._injectedModules[moduleName] = module;

            var components = module._components;
            for (var componentName in components) {
                if (components.hasOwnProperty(componentName)) {
                    var component = module._components[componentName];
                    if (component === null) {
                        throw new Error('Module: "' + this.name + '" has null component with name "' + componentName + '".');
                    }

                    worldInstance._injectedComponents[component.name] = component;
                }
            }

            var systems = module._systems;
            for (var systemName in systems) {
                if (systems.hasOwnProperty(systemName)) {
                    var system = systems[systemName];
                    if (system === null) {
                        throw new Error('Module: "' + this.name + '" has null system with name "' + systemName + '".');
                    }

                    worldInstance._injectedSystems[system.name] = system;
                }
            }
        }
    }

    return worldInstance;
};

GameEngine.removeAllWorlds = function() {
    worlds = {};
};

GameEngine.removeAllModules = function() {
    modules = {};
};