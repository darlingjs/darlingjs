'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

var Module = function(){
    this._components = {};
    this._systems = {};
};

Module.prototype.has = function(name) {
    return isDefined(this._components[name]) ||
        isDefined(this._systems[name]);
};

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
        throw new Error('System name must to be defined.');
    }
    config = config || {};
    config.name = name;

    if (isDefined(this._systems[name])) {
        throw new Error('Module "' + this.name + '" already has system with name "' + name + '".');
    }
    this._systems[name] = config;
    return this;
};