'use strict';

var List = require('../utils/list');
var Promise = require('bluebird');
var wrap = require('../utils/wrap');

var utils = require('../utils/utils');
var copy = utils.copy;
var isArray = utils.isArray;
var isFunction = utils.isFunction;

var Pipeline = function(pipeline, system) {
  var world;

  /**
   * @private
   *
   * create handler for each entity
   *
   * @param lazy
   * @param handler
   * @returns {Function}
   */
  function wrapHandlerForEachEntity(lazy, handler) {
    if (lazy) {
      return wrapLazyHandler(handler);
    } else {
      return wrapActiveHandler(handler);
    }
  }

  /**
   * @private
   *
   * create handler with promises for each entity
   *
   * @param handler
   * @returns {Function}
   */
  function wrapLazyHandler(handler) {
    return function(interval) {
      var iterator = system.entities.quickIterator();
      function iterate() {
        if (!iterator.hasNext()) {
          return null;
        }

        return handler(iterator.next(), interval)
          .then(iterate);
      }

      return iterate();
    };
  }

  /**
   * @private
   *
   * create handler without promises for each entity
   *
   * @param handler
   * @returns {Function}
   */
  function wrapActiveHandler(handler) {
    return function(interval) {
      system.entities.forEach(handler, null, interval);
    };
  }

  if (pipeline) {
    world = pipeline.world || pipeline;
  }

  this.world = world;

  this.system = system;

  if (system) {
    //get all handlers of system and add them to tracking list
    var entities = world.filterByComponents(system.require);

    system.entities = entities;

    if (system.added) {
      system.added();
    }

    //TODO: there no way to remove system yet
    //system.removed = null;

    if (system.addEntity) {
      entities.on('add', function(entity) {
        system.addEntity(entity, world);
      });
    }

    if (system.removeEntity) {
      entities.on('remove', function(entity) {
        system.removeEntity(entity, world);
      });
    }

    this.lazy = pipeline.lazy || system.lazy;

    if (system.beforeUpdate) {
      this.beforeUpdateList = pipeline.beforeUpdateList.clone();
      this.beforeUpdateList.add(wrapHandlerForEachEntity(this.lazy, function(entity, interval) {
        return system.beforeUpdate(entity, interval, world);
      }));
    } else {
      this.beforeUpdateList = pipeline.beforeUpdateList;
    }

    if (system.updateOne) {
      this.updateOneList = pipeline.updateOneList.clone();
      this.updateOneList.add(wrapHandlerForEachEntity(this.lazy, function (entity, interval) {
        return system.updateOne(entity, interval, world);
      }));
    } else {
      this.updateOneList = pipeline.updateOneList;
    }

    if (system.updateAll) {
      this.updateAllList = pipeline.updateAllList.clone();
      this.updateAllList.add(function(interval) {
        if (system.entities.length() > 0) {
          return system.updateAll(entities, interval, world);
        }
      });
    } else {
      this.updateAllList = pipeline.updateAllList;
    }

    if (system.afterUpdate) {
      this.afterUpdateList = pipeline.afterUpdateList.clone();
      this.afterUpdateList.add(wrapHandlerForEachEntity(this.lazy, function(entity, interval) {
        return system.afterUpdate(entity, interval, world);
      }));
    } else {
      this.afterUpdateList = pipeline.afterUpdateList;
    }
  } else {
    this.beforeUpdateList = new List();
    this.updateAllList = new List();
    this.updateOneList = new List();
    this.afterUpdateList = new List();
  }

//Do we really need them?

  wrap(pipeline, this);
};

/**
 * set updater on game pipeline
 *
 * @param updater
 * @returns {Pipeline}
 */
Pipeline.prototype.live = function(updater) {
  updater(this.step.bind(this));
  return this;
};

/**
 * put system in a pipe line of the game
 * @param system
 * @returns {Pipeline}
 */
Pipeline.prototype.pipe = function(system) {
  if (isFunction(system && system.getInitialState)) {
    system.state = copy(system.state, system.getInitialState());
  }

  if (isArray(system && system.sequence)) {
    var p = this;
    for(var i = 0; i < system.sequence.length; i++) {
      var s = system.sequence[i];
      p = p.pipe(s);
    }
    return p;
  }
  return new Pipeline(this, system);
};

/**
 * push update on pipeline for entities in a world
 * @param interval
 */
Pipeline.prototype.step = function(interval) {
  var iHandler;

  if (this.lazy) {
    var promise = Promise.resolve();
    iHandler = this.beforeUpdateList.quickIterator();
    while(iHandler.hasNext()) {
      promise = promise.then((function(handler) {
        return function() {
          return handler(interval);
        };
      })(iHandler.next()));
    }

    iHandler = this.updateOneList.quickIterator();
    while(iHandler.hasNext()) {
      promise = promise.then((function(handler) {
        return function() {
          return handler(interval);
        };
      })(iHandler.next()));
    }

    iHandler = this.updateAllList.quickIterator();
    while(iHandler.hasNext()) {
      promise = promise.then((function(handler) {
        return function() {
          return handler(interval);
        };
      })(iHandler.next()));
    }

    iHandler = this.afterUpdateList.quickIterator();
    while(iHandler.hasNext()) {
      promise = promise.then((function(handler) {
        return function() {
          return handler(interval);
        };
      })(iHandler.next()));
    }

    return promise;
  } else {
    iHandler = this.beforeUpdateList.quickIterator();
    while(iHandler.hasNext()) {
      iHandler.next()(interval);
    }

    iHandler = this.updateOneList.quickIterator();
    while(iHandler.hasNext()) {
      iHandler.next()(interval);
    }

    iHandler = this.updateAllList.quickIterator();
    while(iHandler.hasNext()) {
      iHandler.next()(interval);
    }

    iHandler = this.afterUpdateList.quickIterator();
    while(iHandler.hasNext()) {
      iHandler.next()(interval);
    }
  }
};

module.exports = Pipeline;
