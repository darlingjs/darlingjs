'use strict';

/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

var Entity = function() {
    this._components = {};
};

Entity.prototype.$add = function(name, instance) {
    if (isUndefined(name) || isUndefined(instance)) {
        throw new Error('Can\'t add null component.');
    }

    if (this.$has(name)) {
        this.$remove(name);
    }

    this._components[name] = instance;
    this[name] = instance;
};

Entity.prototype.$remove = function(name) {
    if (!this.$has(name)) {
        return;
    }

    delete this._components[name];
    delete this[name];
};

Entity.prototype.$has = function(name) {
    return isDefined(this._components[name]);
};