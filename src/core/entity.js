/**
 * Project: GameEngine.
 * @copyright (c) 2013, Eugene-Krevenets
 */

/**
 * @class Entity
 * @classdesc
 *
 * Entity is bag of game property in one instance.
 * For example instance of bonus with component position in (ng2D).
 *
 * @constructor
 */
var Entity = function() {

};

mixin(Entity.prototype, Events);

/**
 * Name of entity
 * @type {string}
 */
Entity.prototype.$name = '';

/**
 * World of entity
 * @private
 * @type {World}
 */
Entity.prototype.$$world = null;

/**
 * Add new Component to entity
 *
 * @example
 * <pre>
 entity.$add('ng2D', {
   x: 1.0,
   y: 3.0
 });
 * </pre>
 * @param {string|Component} value The name of the Component or
 * @param {object} [config] The config of adding Component
 * @return {Component}
 */
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

    if (this[name]) {
        this.$remove(name);
    }

    this[name] = instance;

    this.trigger('add', this, instance);
    return instance;
};

/**
 * Remove component from entity
 *
 * @example
 * <pre>
 entity.$remove('ngVisible');
 * </pre>
 * @param {string|Component} value The name or instance of component
 * @return {Component}
 */
Entity.prototype.$remove = function(value) {
    var instance;
    var name;
    if (isComponent(value)) {
        name = value.$name;
        instance = value;
    } else if (isString(value)) {
        name = value;
        instance = this[value];
    } else {
        throw new Error('Can\'t remove from component ' + value);
    }

    if (!this[name]) {
        return;
    }

    //nullity optimization
    //delete this[name];
    this[name] = null;

    this.trigger('remove', this, instance);

    return instance;
};

/**
 * Is entity has component
 * @param {string|Component} value The name or instance of component test
 * @return {boolean}
 */
Entity.prototype.$has = function(value) {
    if (isString(value)) {
        return !!this[value];
    } else {
        return !!this[value.$name];
    }
};

function isComponent(value) {
    return isObject(value) && isDefined(value.$name);
}