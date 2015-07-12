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
var copy = utils.copy;
var isArray = utils.isArray;
var isDefined = utils.isDefined;
var isEmptyObject = utils.isEmptyObject;
var isObject = utils.isObject;
var isString = utils.isString;
var isUndefined = utils.isUndefined;
var List = require('./../utils/list');
var swallowCopy = utils.swallowCopy;

var requestAnimationFrame = require('./../utils/animationFrame').request;
var cancelAnimationFrame = require('./../utils/animationFrame').cancel;

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
  this.$$injectedSystems = {};

  this.$$systems = [];
  this.$$beforeUpdateHandledSystems = [];
  this.$$afterUpdateHandledSystem = [];
  this.$$updateHandledSystem = [];

  this.$$families = {};
  this.$playing = false;

  this.entities = new List('World');
  this.name = '';
  //this.$$entitiesHead = this.$$entitiesTail = null;
  //this.$$entitiesCount = 0;
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

  if (this.$$families[componentsString]) {
    return this.$$families[componentsString].nodes;
  }

  for (var i = 0, l = componentsArray.length; i < l; i++) {
    componentsHash[componentsArray[i]] = true;
  }

  var family = new Family();
  family.components = componentsArray;
  family.componentsHash = componentsHash;
  family.componentsString = componentsString;
  this.$$families[componentsString] = family;
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
  var node = this.entities.$head;
  while (node) {
    var entity = node.instance;
    if (entity._name === value) {
      return entity;
    }
    node = node.$next;
  }

  return null;
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
  var node = this.entities.$head;
  while (node) {
    var entity = node.instance,
      nextEntity = node.$next;

    this.remove(entity);
    node = nextEntity;
  }
};

/**
 * Get number of entities
 * @return {number}
 */
World.prototype.numEntities = function () {
  return this.entities.length();
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

    if (isDefined(components.$name)) {
      entity._name = components.$name;
    }
  }

  if (!arguments[componentsIndex]) {
    this.addEntity(entity);
  }

  return entity;
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
 * Define component.
 * if component already defined under _name than function return component with config customization.
 * if component doesn't define function defines it the world under _name with @config state.
 * But if config doesn't defined it's create empty puppet
 *
 * @param {string} name name of component
 * @param {object} [config] state of component
 *
 * @return {Object}
 */
World.prototype.c = World.prototype.component = function (name, config) {
  var defaultConfig;
  var instance;

  if (!isString(name)) {
    throw new Error('1st argument must be [String]');
  }

  defaultConfig = this.components[name];
  if (isUndefined(defaultConfig)) {
    //define new custom component
    if (isDefined(config) && config !== null) {
      if (!config._name && isObject(config)) {
        config._name = name;
      }
      this.components[name] = config;
    } else {
      config = {
        _name: name
      };
      this.components[name] = config;
      config = copy(config);
    }
    instance = config;
  } else {
    instance = copy(defaultConfig);
    if (isDefined(config) && config !== null) {
      swallowCopy(instance, config);
    }
  }

  return instance;
};

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

  for (var componentsString in this.$$families) {
    this._matchNewEntityToFamily(componentsString, entity);
  }

  afterMatch(entity, 'matchNewEntityToFamilies');
};

/**
 * @ignore
 */
World.prototype._matchNewEntityToFamily = function (componentsString, entity) {
  var family = this.$$families[componentsString];
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

  for (var componentsString in this.$$families) {
    this._matchRemoveEntityToFamily(componentsString, entity);
  }

  afterMatch(entity, 'matchRemoveEntityToFamilies');
};

/**
 * @ignore
 */
World.prototype._matchRemoveEntityToFamily = function (componentsString, entity) {
  var family = this.$$families[componentsString];
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

  for (var componentsString in this.$$families) {
    this._mapAddedComponentToFamily(componentsString, entity);
  }

  afterMatch(entity, 'onComponentAdd');
};

/**
 * @ignore
 */
World.prototype._mapAddedComponentToFamily = function (componentsString, entity) {
  var family = this.$$families[componentsString];
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

  for (var componentsString in this.$$families) {
    this._mapRemovedComponentToFamily(componentsString, entity, component);
  }

//    afterMatch(entity, 'onComponentRemove');
};

World.prototype._mapRemovedComponentToFamily = function (componentsString, entity, component) {
  var family = this.$$families[componentsString];
  family.removeIfMatch(entity, component);
};

/**
 * Start update the World every 1/60 of second
 */
World.prototype.$start = function () {
  if (this.$playing) {
    return;
  }

  this.$playing = true;

  var self = this;
  var previousTime = 0;
  (function step(time) {
    var deltaTime = 0;
    if (previousTime) {
      deltaTime = time - previousTime;
    }

    self.$update(deltaTime);
    previousTime = time;
    if (self.$playing) {
      self.$requestAnimationFrameId = requestAnimationFrame(step);
    }
  })(0);
};

/**
 * Stop update the World every 1/60 of second
 */
World.prototype.$stop = function () {
  if (!this.$playing) {
    return;
  }
  this.$playing = false;

  cancelAnimationFrame(this.$requestAnimationFrameId);
};

module.exports = World;
