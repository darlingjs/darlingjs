'use strict';

var List = require('../utils/list');
var wrap = require('../utils/wrap');

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

    if (system.beforeUpdate) {
      this.beforeUpdateList = pipeline.beforeUpdateList.clone();
      this.beforeUpdateList.add(function(entity, interval) {
        system.beforeUpdate(entity, interval, world);
      });
    } else {
      this.beforeUpdateList = pipeline.beforeUpdateList;
    }

    if (system.updateOne) {
      this.updateOneList = pipeline.updateOneList.clone();
      this.updateOneList.add(function(entity, interval) {
        system.updateOne(entity, interval, world);
      });
    } else {
      this.updateOneList = pipeline.updateOneList;
    }

    if (system.updateAll) {
      this.updateAllList = pipeline.updateAllList.clone();
      this.updateAllList.add(function(interval) {
        system.updateAll(entities, interval, world);
      });
    } else {
      this.updateAllList = pipeline.updateAllList;
    }

    if (system.afterUpdate) {
      this.afterUpdateList = pipeline.afterUpdateList.clone();
      this.afterUpdateList.add(function(entity, interval) {
        system.afterUpdate(entity, interval, world);
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
  return new Pipeline(this, system);
};

/**
 * push update on pipeline for entities in a world
 * @param interval
 */
Pipeline.prototype.step = function(interval) {
  //this.system.updateOne(interval);

  var iHandler,
    entities = this.system.entities;

  iHandler = this.beforeUpdateList.quickIterator();
  while(iHandler.hasNext()) {
    entities.forEach(iHandler.next(), null, interval);
  }

  iHandler = this.updateOneList.quickIterator();
  while(iHandler.hasNext()) {
    entities.forEach(iHandler.next(), null, interval);
  }

  if (entities.length() > 0) {
    iHandler = this.updateAllList.quickIterator();
    while(iHandler.hasNext()) {
      iHandler.next()(interval);
    }
  }

  iHandler = this.afterUpdateList.quickIterator();
  while(iHandler.hasNext()) {
    entities.forEach(iHandler.next(), null, interval);
  }
};

module.exports = Pipeline;
