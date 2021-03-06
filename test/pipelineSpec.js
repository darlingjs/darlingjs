'use strict';

var chai = require('chai');
var expect = require('chai').expect;
var faker = require('faker');
var Pipeline = require('../lib/core/pipeline');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var testWorldInstance = require('./worldInstanceSpecHelper');
var darling = require('../');

chai.use(sinonChai);

describe('pipeline', function() {
  var pipeline;

  beforeEach(function() {
    pipeline = new Pipeline();
    pipeline.name = faker.name.findName();
  });

  describe('pipe line', function() {
    it('should return stream on pipe', function() {
      var w = pipeline.pipe();
      expect(w).to.be.instanceOf(Pipeline);
    });
  });

  describe('live', function() {
    it('should pass step function', function() {
      var step = null;
      pipeline.live(function(_step_) {
        step = _step_;
      });
      expect(step).to.be.a('function');
    });

    it('should mixin start/stop methods of runner to pipeline', function() {
      var start = sinon.spy(),
        stop = sinon.spy();

      pipeline = pipeline.live(function() {
        return {
          start: start,
          stop: stop
        };
      });

      expect(pipeline).to.have.property('start');
      expect(pipeline).to.have.property('stop');
      pipeline.start();
      expect(start).to.have.been.calledOnce;
      pipeline.stop();
      expect(stop).to.have.been.calledOnce;
    });
  });

  describe('world wrapper', function() {
    var world;

    beforeEach(function() {
      pipeline = darling.world();
      pipeline.name = faker.name.findName();

      world = pipeline.world;
    });

    testWorldInstance(function() {
      return pipeline;
    });

    it('should have property with link to world', function() {
      pipeline = pipeline.pipe();
      expect(pipeline).to.have.property('world', world);
    });

    it('should have same world on any level of pipe', function() {
      var pipeline1 = pipeline.pipe();
      var pipeline2 = pipeline1.pipe();

      expect(pipeline1.world).to.be.equal(pipeline2.world);
    });
  });
});
