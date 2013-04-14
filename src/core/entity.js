'use strict';

/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

var Entity = function() {
    this.$$components = {};
    this.$$world = null;
    mixin(this, Events);
};

Entity.prototype.$add = function(value, config) {
    var instance;
    var name;

    if (isString(value)) {
        instance = this.$$world.$component(value, config);
        name = value;
    } else if (isComponent(value)) {
        instance = value;
        name = instance.$name;
    } else if (isUndefined(value)) {
        throw new Error('Can\'t add component with null name.');
    } else {
        throw new Error('Can\'t add ' + value + ' to entity');
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

Entity.prototype.$remove = function(value) {
    var instance;
    var name;
    if (isComponent(value)) {
        name = value.$name;
        instance = value;
    } else if (isString(value)) {
        name = value;
        instance = this.$$components[value];
    } else {
        throw new Error('Can\'t remove from component ' + value);
    }

    if (!this.$has(name)) {
        return;
    }

    delete this.$$components[name];
    delete this[name];

    this.trigger('remove', this, instance);

    return instance;
};

Entity.prototype.$has = function(value) {
    if (isComponent(value)) {
        return isDefined(this.$$components[value.$name]);
    } else {
        return isDefined(this.$$components[value]);
    }
};

function isComponent(value) {
    return isObject(value) && isDefined(value.$name);
}