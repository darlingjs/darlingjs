'use strict';

var List = require('../utils/list');
var Promise = require('bluebird');
var wrap = require('../utils/wrap');

var utils = require('../utils/utils');
var copy = utils.copy;
var isFunction = utils.isFunction;

var Pipeline = function(pipeline, system) {
  var world;
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

      var beforeUpdateEntity = function(entity, interval) {
        system.beforeUpdate(entity, interval, world);
      };

      this.beforeUpdateList.add(function(interval) {
        system.entities.forEach(beforeUpdateEntity, null, interval);
      });
    } else {
      this.beforeUpdateList = pipeline.beforeUpdateList;
    }

    if (system.updateOne) {
      this.updateOneList = pipeline.updateOneList.clone();

      var updateOneEntity = function (entity, interval) {
        return system.updateOne(entity, interval, world);
      };

      if (this.lazy) {
        this.updateOneList.add(function(interval) {
          var iterator = system.entities.quickIterator();
          function iterate() {
            if (!iterator.hasNext()) {
              return null;
            }

            return updateOneEntity(iterator.next(), interval)
              .then(iterate);
          }

          return iterate();
        });
      } else {
        this.updateOneList.add(function(interval) {
          system.entities.forEach(updateOneEntity, null, interval);
        });
      }
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

      var updateAfterEntity = function(entity, interval) {
        system.afterUpdate(entity, interval, world);
      };

      this.afterUpdateList.add(function(interval) {
        system.entities.forEach(updateAfterEntity, null, interval);
      });
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
