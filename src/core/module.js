'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

var Module = function(){
    this.$$components = {};
    this.$$systems = {};
};

Module.prototype.has = function(name) {
    return isDefined(this.$$components[name]) ||
           isDefined(this.$$systems[name]);
};

/**
 * Declare Component
 *
 * @type {Function}
 */
Module.prototype.c = Module.prototype.component = function(name, defaultState) {
    defaultState = defaultState || {};
    var component = {
        name: name,
        defaultState: defaultState
    };
    this.$$components[name] = component;
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

    if (isDefined(this.$$systems[name])) {
        throw new Error('Module "' + this.name + '" already has system with name "' + name + '".');
    }
    this.$$systems[name] = config;
    return this;
};