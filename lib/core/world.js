/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 *
 * DESIGN NOTES
 * ============
 *
 * Because entity can frequently will be added and removed,
 * them implemented by list.
 *
 */

'use strict';

var Entity = require('./entity');
var Family = require('./family');

var utils = require('./../utils/utils');
var isArray = utils.isArray;
var isEmptyObject = utils.isEmptyObject;
var isObject = utils.isObject;
var isString = utils.isString;
var isUndefined = utils.isUndefined;
var List = require('./../utils/list');

/**
 * @class World
 * @classdesc
 *
 * Game World. Contain Modules, System and Entities.
 *
 * @constructor
 */
var World = function () {
  this.components = {};

  this._families = {};

  this.entities = new List('World');
  this.name = '';
};

/**
 * Add Entity to the World
 * @private
 * @param {Entity} instance The instance of Entity
 * @return {Entity}
 */
World.prototype.add = World.prototype.addEntity = function (instance) {
  this.entities.add(instance);
  instance._world = this;
  instance.on('add', this._onComponentAdd, this);
  instance.on('remove', this._onComponentRemove, this);
  this._matchNewEntityToFamilies(instance);
  return instance;
};

var entityUID = 0;
function getUniqEntityName() {
  return 'entity_' + entityUID++;
}

/**
 * @description Build and add Entity
 * @see Entity
 *
 * @example
 * <pre>
 //config as array
 GameEngine.e('player', [
 'ngDOM', { color: 'rgb(255,0,0)' },
 'ng2D', { x: 0, y: 50 },
 'ngControl',
 'ngCollision'
 ]));

 //or config as object
 GameEngine.e('player', {
   ngDOM: { color: 'rgb(255,0,0)' },
   ng2D: {x : 0, y: 50},
   ngControl: {},
   ngCollision: {}
 }));

 * </pre>
 *
 * @type {Function}
 *
 * @param {string} name (optional) entity name
 * @param {object} config (optional) config object of entity
 * @param {boolean} doesntAddToWorld (optional) doen't add entity to World
 * @return {Entity}
 */
World.prototype.e = World.prototype.entity = function () {
  var name = '';
  var componentsIndex = 0;

  if (isString(arguments[0])) {
    name = arguments[0];
    componentsIndex = 1;
  } else {
    name = getUniqEntityName();
  }

  var entity = new Entity();
  entity._name = name;
  entity._world = this;

  if (isArray(arguments[componentsIndex])) {
    var componentsArray = arguments[componentsIndex];
    componentsIndex++;
    for (var index = 0, count = componentsArray.length; index < count; index++) {
      var componentName = componentsArray[index];
      if (isString(componentName)) {
        entity.add(componentName);
      }
    }
  } else if (isObject(arguments[componentsIndex])) {
    var components = arguments[componentsIndex];
    componentsIndex++;
    mapComponents(components, entity);
  }

  if (!arguments[componentsIndex]) {
    this.addEntity(entity);
  }

  return entity;
};

/**
 * destroy world
 */
World.prototype.destroy = function() {
  this._families = {};
  this.entities = new List();

  //TODO: remove pipelines and stop updaters
};

/**
 * filter nodes by their components.
 * @param {array|string} (request) The request filter
 * @return {*}
 * @see Entity
 */
World.prototype.filterByComponents = function (request) {
  var componentsArray;
  var componentsString;
  var componentsHash = {};
  if (isArray(request)) {
    componentsString = request.join(',');
    componentsArray = request;
  } else if (isString(request)) {
    componentsString = request;
    componentsArray = request.split(',');
  } else if (isUndefined(request)) {
    return this.entities;
  } else {
    throw new Error('Can\'t query entities by ' + request);
  }

  if (this._families[componentsString]) {
    return this._families[componentsString].nodes;
  }

  for (var i = 0, l = componentsArray.length; i < l; i++) {
    componentsHash[componentsArray[i]] = true;
  }

  var family = new Family();
  family.components = componentsArray;
  family.componentsHash = componentsHash;
  family.componentsString = componentsString;
  this._families[componentsString] = family;
  this.entities.forEach(function (e) {
    family.newEntity(e);
  });
  return family.nodes;
};

/**
 * Get entity by name
 * @param {string} value
 * @return {Entity}
 */
World.prototype.filterByName = function (value) {
  var node = this.entities.head;
  while (node) {
    var entity = node.instance;
    if (entity._name === value) {
      return entity;
    }
    node = node.next;
  }

  return null;
};

/**
 * Get number of entities
 * @return {number}
 */
World.prototype.numEntities = function () {
  return this.entities.length();
};

/**
 * Remove Entity from the World
 * @private
 * @param {Entity} instance
 * @return {Entity}a
 */
World.prototype.remove = function (instance) {
  instance._world = null;
  this.entities.remove(instance);
  this._matchRemoveEntityToFamilies(instance);
  instance.off('add', this._onComponentAdd);
  instance.off('remove', this._onComponentRemove);
  return instance;
};

/**
 * Remove all entities from the World
 */
World.prototype.removeAllEntities = function () {
  var node = this.entities.head;
  while (node) {
    var entity = node.instance,
      nextEntity = node.next;

    this.remove(entity);
    node = nextEntity;
  }
};

/**
 * @ignore
 */
function mapComponents(components, entity) {
  for (var key in components) {
    mapComponent(components, key, entity);
  }
}

/**
 * @ignore
 */
function mapComponent(components, key, entity) {
  if (components.hasOwnProperty(key) && key.charAt(0) !== '$') {
    var value = components[key];
    if (value === false) {
      entity[key] = null;
    } else if (isEmptyObject(value) || value === null) {
      entity.add(key, null);
    } else {
      entity.add(key, value);
    }
  }
}

/**
 * @ignore
 * @param entity
 * @param phase
 * @param context
 * @param phaseFunction
 * @param args
 * @return {boolean}
 */
function beforeMatch(entity, phase, context, phaseFunction, args) {
  if (isUndefined(entity._matchingToFamily)) {
    entity._matchingToFamily = {
      processing: false,
      phases: {}
    };
  }

  var phaseHandler = entity._matchingToFamily.phases[phase];
  if (isUndefined(phaseHandler)) {
    phaseHandler = [];
    entity._matchingToFamily.phases[phase] = phaseHandler;
  }

  if (entity._matchingToFamily.processing) {
    phaseHandler.push({
      fn: phaseFunction,
      ctx: context,
      args: args
    });
    return false;
  }

  entity._matchingToFamily.processing = true;
  return true;
}

/**
 * @ignore
 * @param entity
 */
function afterMatch(entity) {
  entity._matchingToFamily.processing = false;
  var phases = entity._matchingToFamily.phases;
  for (var key in phases) {
    invokeStoredHandlers(phases, key, entity);
  }
}

/**
 * @ignore
 */
function invokeStoredHandlers(phases, key, entity) {
  if (phases.hasOwnProperty(key)) {
    var phaseHandlerArray = entity._matchingToFamily.phases[key];
    if (phaseHandlerArray.length > 0) {
      var phaseHandler = phaseHandlerArray.pop();
      phaseHandler.fn.apply(phaseHandler.ctx, phaseHandler.args);
    }
  }
}

/**
 * Architecture Design:
 *
 * Goal:
 * Should apply only one match function simultaneously.
 *
 * Solution:
 * BeforeMatch we are verify that we are not in match phase. Is so, just store operation.
 * in AfterMatch we are execute each stored operations
 *
 * @ignore
 * @param entity
 */
World.prototype._matchNewEntityToFamilies = function (entity) {
  if (!beforeMatch(entity, 'matchNewEntityToFamilies', this, this._matchNewEntityToFamilies, arguments)) {
    return;
  }

  for (var componentsString in this._families) {
    this._matchNewEntityToFamily(componentsString, entity);
  }

  afterMatch(entity, 'matchNewEntityToFamilies');
};

/**
 * @ignore
 */
World.prototype._matchNewEntityToFamily = function (componentsString, entity) {
  var family = this._families[componentsString];
  family.newEntity(entity);
};

/**
 * @ignore
 * @param entity
 */
World.prototype._matchRemoveEntityToFamilies = function (entity) {
  if (!beforeMatch(entity, 'matchRemoveEntityToFamilies', this, this._matchRemoveEntityToFamilies, arguments)) {
    return;
  }

  for (var componentsString in this._families) {
    this._matchRemoveEntityToFamily(componentsString, entity);
  }

  afterMatch(entity, 'matchRemoveEntityToFamilies');
};

/**
 * @ignore
 */
World.prototype._matchRemoveEntityToFamily = function (componentsString, entity) {
  var family = this._families[componentsString];
  family.removeIfMatch(entity);
};

/**
 * @ignore
 * @param entity
 */
World.prototype._onComponentAdd = function (entity) {
  if (!beforeMatch(entity, 'onComponentAdd', this, this._onComponentAdd, arguments)) {
    return;
  }

  for (var componentsString in this._families) {
    this._mapAddedComponentToFamily(componentsString, entity);
  }

  afterMatch(entity, 'onComponentAdd');
};

/**
 * @ignore
 */
World.prototype._mapAddedComponentToFamily = function (componentsString, entity) {
  var family = this._families[componentsString];
  family.addIfMatch(entity);
};

/**
 * @ignore
 * @param entity
 * @param component
 */
World.prototype._onComponentRemove = function (entity, component) {
//    if (!beforeMatch(entity, 'onComponentRemove', this, this._onComponentRemove, arguments)) {
//        return;
//    }

  for (var componentsString in this._families) {
    this._mapRemovedComponentToFamily(componentsString, entity, component);
  }

//    afterMatch(entity, 'onComponentRemove');
};

World.prototype._mapRemovedComponentToFamily = function (componentsString, entity, component) {
  var family = this._families[componentsString];
  family.removeIfMatch(entity, component);
};

module.exports = World;
