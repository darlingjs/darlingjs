'use strict';

var chai = require('chai');
var darling = require('../');
var expect = chai.expect;
var _ = require('lodash');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

chai.use(sinonChai);

describe('system', function() {
  var emptyEntity, world, system, systemConfig, pipeline;

  beforeEach(function() {
    pipeline = darling.world();
    world = pipeline.world;
    emptyEntity = pipeline.e({});

    systemConfig = {
      //(entity, interval, world)
      updateOne: sinon.spy(),
      //(entities, interval, world)
      updateAll: sinon.spy()
    };

    system = darling.system(systemConfig);
  });

  it('should call update one handler on step(interval)', function() {
    var updateOneHandler = sinon.spy();

    var stream = pipeline
      .pipe({
        require: 'c1',
        updateOne: updateOneHandler
      });

    var e = world.e(['c1']);

    stream.step(100);

    expect(updateOneHandler).to.have.been.calledOnce;
    expect(updateOneHandler).to.have.been.calledWith(e, 100, world);
  });

  it('should call update all handler on step(interval)', function() {
    var updateAllHandler = sinon.spy();

    var stream = pipeline
      .pipe({
        require: 'c1',
        updateAll: updateAllHandler
      });

    world.e(['c1']);

    stream.step(100);

    expect(updateAllHandler).to.have.been.calledOnce;
  });

  it('should call addEntity on entity was added', function() {
    var addEntityHandler = sinon.spy();

    pipeline
      .pipe({
        require: 'c1',
        addEntity: addEntityHandler
      });

    expect(addEntityHandler).to.not.have.been.called;

    var e = pipeline.e(['c1']);

    expect(addEntityHandler).to.have.been.calledWith(e, world);
  });

  it('should call removeEntity on entity was removed', function() {
    var removeEntityHandler = sinon.spy();

    pipeline
      .pipe({
        require: 'c1',
        removeEntity: removeEntityHandler
      });

    var e = pipeline.e(['c1']);

    expect(removeEntityHandler).to.not.have.been.called;

    pipeline.remove(e);

    expect(removeEntityHandler).to.have.been.calledWith(e, world);
  });

  it('should call added on system added to pipeline', function() {
    var addedHandler = sinon.spy();

    pipeline
      .pipe({
        require: 'c1',
        added: addedHandler
      });

    expect(addedHandler).to.have.been.calledOnce;
  });

  it('should call update one handler on step(interval) for each system that use right component', function() {
    var updateOneHandler1 = sinon.spy(),
      updateOneHandler2 = sinon.spy(),
      updateOneHandler3 = sinon.spy();

    var stream = pipeline
      .pipe({
        require: 'c1',
        updateOne: updateOneHandler1
      })
      .pipe({
        require: 'c1',
        updateOne: updateOneHandler2
      })
      .pipe({
        require: 'c1',
        updateOne: updateOneHandler3
      });

    world.e(['c1']);

    stream.step(100);

    expect(updateOneHandler1).to.have.been.calledOnce;
    expect(updateOneHandler2).to.have.been.calledOnce;
    expect(updateOneHandler3).to.have.been.calledOnce;
  });

  it('should call update of system in a pipe line if there any entity', function() {
    var makeStep = _.noop;
    var updater = function(_step_) {
      makeStep = _step_;
    };

    pipeline
      .pipe(system())
      .live(updater);

    makeStep(100);

    expect(systemConfig.updateOne).to.have.been.calledOnce;

    expect(systemConfig.updateOne).to.have.been.calledWith(emptyEntity, 100, world);
  });

  it('should update all if match does not defined', function() {
    var updateAllHandler = sinon.spy();

    var stream = pipeline
      .pipe({
        updateAll: updateAllHandler
      });

    world.e(['c2']);

    stream.step(100);

    expect(updateAllHandler).to.have.been.called;
  });

  it('should update one if match does not defined', function() {
    var updateOneHandler = sinon.spy();

    var stream = pipeline
      .pipe({
        updateOne: updateOneHandler
      });

    world.e(['c2']);

    stream.step(100);

    expect(updateOneHandler).to.have.been.called;
  });

  it('should not call update all if does not match with requires', function() {
    var updateAllHandler = sinon.spy();

    var stream = pipeline
      .pipe({
        require: 'c1',
        updateAll: updateAllHandler
      });

    world.e(['c2']);

    stream.step(100);

    expect(updateAllHandler).to.not.have.been.called;
  });

  it('should not call update one if does not match with requires', function() {
    var updateOneHandler = sinon.spy();

    var stream = pipeline
      .pipe({
        require: 'c1',
        updateOne: updateOneHandler
      });

    world.e(['c2']);

    stream.step(100);

    expect(updateOneHandler).to.not.have.been.called;
  });

  it('should init initial state on create', function() {
    var getInitialStateStub = sinon.stub().returns({
      value1: 12345,
      value2: 'qwerty'
    });

    var stream = pipeline
      .pipe({
        getInitialState: getInitialStateStub
      });

    expect(getInitialStateStub).to.have.been.calledOnce;
    expect(stream.system.state).to.have.property('value1', 12345);
    expect(stream.system.state).to.have.property('value2', 'qwerty');
  });
});
