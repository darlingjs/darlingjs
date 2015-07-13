'use strict';

var expect = require('chai').expect;
var faker = require('faker');
var testWorldInstance = require('./worldInstanceSpecHelper');
var World = require('../lib/core/world');

describe('world', function() {
  var world;

  beforeEach(function() {
    world = new World();
  });

  testWorldInstance(function() {
    world.name = faker.name.findName();
    return world;
  });

  describe('destroy', function() {
    it('should remove all entities', function() {
      world.e({});
      world.e({});
      expect(world.numEntities()).to.be.equal(2);
      world.destroy();
      expect(world.numEntities()).to.be.equal(0);
    });
  });
});
