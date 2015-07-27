'use strict';

var List = require('../utils/list');
var Promise = require('bluebird');
var wrap = require('../utils/wrap');

var utils = require('../utils/utils');
var copy = utils.copy;
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
      var count = 0;

      function iterate() {
        if (!iterator.hasNext()) {
          return count;
        }

        count++;

        return handler(iterator.next(), interval)
          .then(iterate);
      }

      var result = iterate();
      if (result === 0) {
        return Promise.resolve(0);
      }
      return result;
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
      return Promise.resolve(0);
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
          var p = system.updateAll(entities, interval, world);
          if (p && p.then) {
            return p.then(function() {
              return 1;
            });
          }
        }
        return Promise.resolve(0);
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

    if (system.tap) {
      this.tapList = pipeline.tapList.clone();
      this.tapList.add(function(interval) {
        var p = system.tap(entities, interval, world);
        if (p && p.then) {
          return p.then(function() {
            return 1;
          });
        }
        return Promise.resolve(0);
      });
    } else {
      this.tapList = pipeline.tapList;
    }
  } else {
    this.beforeUpdateList = new List();
    this.updateAllList = new List();
    this.updateOneList = new List();
    this.afterUpdateList = new List();
    this.tapList = new List();
  }

  this.handlersList = [
    this.beforeUpdateList,
    this.updateAllList,
    this.updateOneList,
    this.afterUpdateList,
    this.tapList
  ];

//Do we really need them?

  wrap(this, world);
};

/**
 * set runner on game pipeline
 *
 * @param runner
 * @returns {Pipeline}
 */
Pipeline.prototype.live = function(runner) {
  var r = runner(this.step.bind(this));
  wrap(this, r);
  return this;
};

/**
 * put system in a pipe line of the game
 * @param system
 * @returns {Pipeline}
 */
Pipeline.prototype.pipe = function(system) {
  if (system && isFunction(system.getInitialState)) {
    system.state = copy(system.state, system.getInitialState());
  }

  if (system && isFunction(system.getSequence)) {
    var p = this;
    var sequence = system.getSequence();
    for(var i = 0; i < sequence.length; i++) {
      var s = sequence[i];
      p = p.pipe(s);
    }
    return p;
  }
  return new Pipeline(this, system);
};

function asyncIterate(promise, list, interval, state) {
  var iHandler = list.quickIterator();
  while(iHandler.hasNext()) {
    promise = promise.then((function(handler) {
      return function() {
        return handler(interval).then(function(handleCount) {
          if (handleCount > 0) {
            state.count++;
          }
        });
      };
    })(iHandler.next()));
  }

  return promise;
}

function syncIterate(list, interval) {
  var iHandler = list.quickIterator();
  while(iHandler.hasNext()) {
    iHandler.next()(interval);
  }
}

/**
 * push update on pipeline for entities in a world
 * @param interval
 */
Pipeline.prototype.step = function(interval) {
  var count = this.handlersList.length;
  var i = 0;

  if (this.lazy) {
    var state = {
      count: 0
    };

    var promise = new Promise(function(resolve) {
      state.count = 0;
      resolve();
    });

    for(i = 0; i < count; i++) {
      promise = asyncIterate(
        promise,
        this.handlersList[i],
        interval,
        state
      );
    }

    return promise.then(function() {
      return state.count;
    });
  } else {
    for(i = 0; i < count; i++) {
      syncIterate(this.handlersList[i], interval);
    }
  }
};

module.exports = Pipeline;
