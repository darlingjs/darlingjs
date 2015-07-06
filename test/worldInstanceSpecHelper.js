'use strict';

var expect = require('chai').expect;

module.exports = function(createWorld) {
  var world;

  beforeEach(function() {
    world = createWorld();
  });

  describe('entity', function() {
    it('should be able to be settled to world', function() {
      var entity = world.entity();
      expect(entity).to.not.be.undefined;
      expect(entity).to.not.null;
    });

    it('should increase number of entities on entity()', function() {
      expect(world.numEntities()).to.be.equal(0);
      world.entity();
      expect(world.numEntities()).to.be.equal(1);
    });

    it('should decrease number of entities on remove()', function() {
      var entity = world.entity();
      expect(world.numEntities()).to.be.equal(1);
      world.remove(entity);
      expect(world.numEntities()).to.be.equal(0);
    });
  });

  describe('live', function() {
    it('should pass step function', function() {
      var step;
      world.live(function(_step_) {
        step = _step_;
      });
      expect(step).to.be.a('function');
    });
  });
};
