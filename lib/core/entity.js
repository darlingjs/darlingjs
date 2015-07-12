/**
 * Project: GameEngine.
 * @copyright (c) 2013, Eugene-Krevenets
 */

'use strict';

var Events = require('./../utils/events');
var isArray = require('./../utils/utils').isArray;
var isDefined = require('./../utils/utils').isDefined;
var isObject = require('./../utils/utils').isObject;
var isString = require('./../utils/utils').isString;
var isUndefined = require('./../utils/utils').isUndefined;
var mixin = require('./../utils/utils').mixin;

/**
 * @private
 *
 * @param value
 * @returns {*}
 */
function isComponent(value) {
  return isObject(value) && isDefined(value._name);
}

/**
 * @class Entity
 * @classdesc
 *
 * Entity is bag of game property in one instance.
 * For example instance of bonus with component position in (ng2D).
 *
 * @constructor
 */
var Entity = function () {

};

mixin(Entity.prototype, Events);

/**
 * Name of entity
 * @type {string}
 */
Entity.prototype._name = '';

/**
 * World of entity
 * @private
 * @type {World}
 */
Entity.prototype._world = null;

var simpleComponents = {};

function getEmptyComponentByName(name) {
  var component = simpleComponents[name];
  if (!component) {
    component = {
      _name: name
    };

    simpleComponents[name] = component;
  }
  return component;
}

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
Entity.prototype.add = function (value, config) {
  var instance;
  var name;

  if (isString(value)) {
    if (this._world) {
      instance = this._world.component(value, config);
    }
    name = value;
  } else if (isComponent(value)) {
    instance = value;
    name = instance._name;
  } else if (isArray(value)) {
    for(var i = value.length - 1; i >= 0; i--) {
      this.add(value[i]);
    }
  } else if (isUndefined(value)) {
    throw new Error('Can\'t add component with null name.');
  } else {
    throw new Error('Can\'t add ' + value + ' to entity');
  }

  if (this[name]) {
    this.$remove(name);
  }

  if (!instance) {
    instance = getEmptyComponentByName(name);
  }

  this[name] = instance || simpleComponents;

  this.trigger('add', this, instance);
  return instance;
};

/**
 * Remove component from entity
 *
 * @example
 * <pre>
 entity.remove('ngVisible');
 * </pre>
 * @param {string|Component} value The name or instance of component
 * @return {Component}
 */
Entity.prototype.remove = function (value) {
  var instance;
  var name;
  if (isComponent(value)) {
    name = value._name;
    instance = value;
  } else if (isString(value)) {
    name = value;
    instance = this[value];
  } else {
    throw new Error('Can\'t remove component ' + value);
  }

  if (!this[name]) {
    //already removed
    return null;
  }

  this.trigger('remove', this, instance);

  //"nullity optimization"
  //
  // delete this[name]
  //is much slower;
  this[name] = null;

  return instance;
};

/**
 * Is entity has component
 *
 * @param {string|Component} value The name or instance of component test
 * @return {boolean}
 */
Entity.prototype.has = function (value) {
  if (isString(value)) {
    return !!this[value];
  } else {
    return !!this[value._name];
  }
};

module.exports = Entity;
