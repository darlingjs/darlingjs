'use strict';

/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

var Entity = function() {
    this.$$components = {};
    this.$$nextSibling = this.$$prevSibling = null;
    this.$$world = null;
    mixin(this, Events);
};

Entity.prototype.$add = function(name, value) {
    var instance;

    if (isUndefined(name)) {
        throw new Error('Can\'t add component with null name.');
    }

    if (value instanceof Entity) {
        instance = value;
    } else {
        instance = this.$$world.$component(name, value);
    }

    if (isUndefined(instance)) {
        throw new Error('Can\'t add null component.');
    }

    if (this.$has(name)) {
        this.$remove(name);
    }

    this.$$components[name] = instance;

    this[name] = instance;

    this.trigger('add', this, instance);
    return instance;
};

Entity.prototype.$remove = function(name) {
    if (!this.$has(name)) {
        return;
    }

    var instance = this.$$components[name];

    delete this.$$components[name];
    delete this[name];

    this.trigger('remove', this, instance);

    return instance;
};

Entity.prototype.$has = function(name) {
    return isDefined(this.$$components[name]);
};