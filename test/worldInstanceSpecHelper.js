'use strict';

var expect = require('chai').expect;
var faker = require('faker');

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

    it('should create entity with random name if we have not pass it', function() {
      var entity = world.entity();
      expect(entity._name).to.be.ok;
    });

    it('should use passed name', function() {
      var name = faker.name.firstName();
      var entity = world.entity(name);
      expect(entity._name).to.be.equal(name);
    });

    it('should have link to the original world', function() {
      var e = world.e();
      expect(e).to.have.property('_world', world.world || world);
    });

    it('should remove all entities on removeAllEntities', function() {
      var count = 10;
      while(--count >= 0) {
        world.e('theEntity-' + count);
      }
      expect(world.numEntities()).to.be.equal(10);
      world.removeAllEntities();
      expect(world.numEntities()).to.be.equal(0);
    });

    it('should filter entities by component and return list of them', function() {
      var e1 = world.e('entity1', ['c1']);
      var e2 = world.e('entity2', ['c1', 'c2']);
      var e3 = world.e('entity3', ['c1', 'c2', 'c3']);

      var list;

      list = world.filterByComponents('c1');
      expect(list.length()).to.be.equal(3);
      expect(list.value()).to.have.members([e1, e2, e3]);

      list = world.filterByComponents('c2');
      expect(list.length()).to.be.equal(2);
      expect(list.value()).to.have.members([e2, e3]);

      list = world.filterByComponents('c3');
      expect(list.length()).to.be.equal(1);
      expect(list.value()).to.have.members([e3]);
    });

    it('should return same list of entity on undefined filter', function() {
      var e1 = world.e('entity1', ['c1']);
      var e2 = world.e('entity2', ['c1', 'c2']);
      var e3 = world.e('entity3', ['c1', 'c2', 'c3']);

      var list = world.filterByComponents();
      expect(list.value()).to.have.members([e1, e2, e3]);
    });

    it('should filter by name', function() {
      world.e('entity1', ['c1']);
      var e2 = world.e('entity2', ['c1', 'c2']);
      world.e('entity3', ['c1', 'c2', 'c3']);

      expect(world.filterByName('entity2')).to.be.equal(e2);
    });

    it('should use components that passed as object', function() {
      var e = world.e({
        comp1: {},
        comp2: 'value'
      });

      expect(e).to.have.property('comp1');
      expect(e.comp1).to.have.property('_name', 'comp1');
      expect(e).to.have.property('comp2', 'value');
    });

    it('should use components that passed as array', function() {
      var e = world.e(['c1', 'c2']);

      expect(e).to.have.property('c1');
      expect(e).to.have.property('c2');
    });

    describe('numEntities', function() {
      it('should return proper count after added and removed entity', function() {
        var e1 = world.e('entity1', ['testComponent1']);
        var e2 = world.e('entity2', ['testComponent2']);
        var e3 = world.e('entity3', ['testComponent2']);
        world.remove(e3);
        world.remove(e2);
        world.remove(e1);
        expect(world.numEntities()).to.be.equal(0);
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
  });

  describe('components', function() {
    it('should return predefined component with _name', function() {
      world.c('component', {
        value: 123
      });
      var c = world.c('component');
      expect(c).to.not.be.undefined;
      expect(c.value).to.be.equal(123);
      expect(c._name).to.be.equal('component');
    });

    it('should return empty component if there no predefined, with _name', function() {
      var c = world.c('unknownComponent');
      expect(c).to.not.be.undefined;
      expect(c).to.have.property('_name', 'unknownComponent');
    });
  });
};
