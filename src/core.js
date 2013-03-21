/**
 * Module
 * @module core
 */

'use strict';

var Module = function(){
    this._components = {};
    this._systems = {};
};

Module.prototype.has = function(name) {
    return isDefined(this._components[name])
        || isDefined(this._systems[name]);
}

/**
 * Declare Component
 *
 * @type {Function}
 */
Module.prototype.c = Module.prototype.component = function(name, defaultState) {
    var component = {
        name: name,
        defaultState: defaultState
    };
    this._components[name] = component;
    return this;
};

/**
 * Declare System. Like a filter in AngularJS
 *
 * @type {Function}
 */
Module.prototype.s = Module.prototype.system = function(name, config) {
    if (isUndefined(name)) {
        throw Error('System name must to be defined.');
    }
    config = config || {};
    config.name = name;

    if (isDefined(this._systems[name])) {
        throw Error('Module "' + this.name + '" already has system with name "' + name + '".');
    }
    var instance = new System();
    instance.name = name;
    this._systems[name] = instance;//copy(config, new System());
    return this;
};

var World = function(){
    this._injectedComponents = {};
    this._injectedModules = {};
    this._injectedSystems = {};
    this._systems = [];
};

World.isInstanceOf = function(instance) {
    return instance.toString() === 'World';
};

World.prototype.name = '';

World.prototype.has = function(name) {
    return isDefined(this._injectedComponents[name])
        || isDefined(this._injectedModules[name])
        || isDefined(this._injectedSystems[name]);
}

World.prototype.isUse = function(name) {
    for (var index = 0, count = this._systems.length; index < count; index++) {
        if (this._systems[index].name === name) {
            return true;
        }
    }

    return false;
}

World.prototype.add = function(value) {
    var instance;

    if (isString(value)){
        instance = this._injectedSystems[value];
        if (isUndefined(instance)) {
            throw Error('Instance of "' + value + '" doesn\'t injected in the world "' + this.name + '".');
        }
    } else {
        instance = value;
    }

    if (instance instanceof World) {
        throw Error('TODO');
    } else if (instance instanceof System) {
        this._systems.push(instance);
    } else {
        throw Error('You can\'t add to World "' + instance + '" type of "' + (typeof instance) + '"');
    }
}

/**
 * @ngdoc function
 * @name GameEngine.e
 * @function
 * @description Build Entity
 *
 * <pre>
     GameEngine.e('player',
     [
         'ngDOM', { color: 'rgb(255,0,0)' },
         'ng2D', {x : 0, y: 50},
         'ngControl',
         'ngCollision'
     ]));
 * </pre>
 *
 * @type {Function}
 */
World.prototype.e = World.prototype.entity = function() {
    var name = '';
    var components = [];
    var componentsIndex = 0;

    if (isString(arguments[0])) {
        name = arguments[0];
        componentsIndex = 1;
    }

    var instance = {
        name: name
    };

    if (isArray(arguments[componentsIndex])) {
        components = arguments[componentsIndex];
    }

    for (var index = 0, count = components.length; index < count; index++) {
        if (isString(components[index])) {
            var componentName = components[index];
            var component = this._injectedComponents[componentName];
            var componentConfig = {};

            if (isUndefined(component)) {
                throw Error('World ' + this.name + ' doesn\'t has component ' + componentName + '. Only ' + this._injectedComponents);
            }

            if (isObject(components[index + 1])) {
                index++;
                componentConfig = components[index];
            }

            var componentInstance = copy(component.defaultState);
            for (var key in componentConfig) {
                componentInstance[key] = componentConfig[key];
            }

            instance[componentName] = componentInstance;
        }
    }

    return instance;
};

var System = function() {

};

var GameEngine = window.GameEngine || (window.GameEngine = {});

var worlds = {};
var modules = {};

GameEngine.m = GameEngine.module = function(name, requires) {
    if (isDefined(modules[name])) {
        throw Error('Module "' + name + '" has already been defined.');
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
        throw Error('World "' + name + '" has already been defined.');
    }

    var worldInstance = new World();
    worldInstance.name = name;
    worlds[name] = worldInstance;

    if (isArray(requires)) {
        for (var index = 0, count = requires.length; index < count; index++) {
            var moduleName = requires[index];
            var module = modules[moduleName];
            if (module === null) {
                throw Error('No module: ' + name);
            }

            worldInstance._injectedModules[moduleName] = module;

            for (var componentName in module._components) {
                var component = module._components[componentName];
                if (component === null) {
                    throw Error('Module: "' + this.name + '" has null component with name "' + componentName + '".');
                }

                worldInstance._injectedComponents[component.name] = component;
            }

            for (var systemName in module._systems) {
                var system = module._systems[systemName];
                if (system === null) {
                    throw Error('Module: "' + this.name + '" has null system with name "' + systemName + '".');
                }

                worldInstance._injectedSystems[system.name] = system;
            }
        }
    }

    return worldInstance;
};

GameEngine.removeAllWorlds = function() {
    worlds = {};
}

GameEngine.removeAllModules = function() {
    modules = {};
}