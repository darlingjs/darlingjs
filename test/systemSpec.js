'use strict';

var chai = require('chai');
var darling = require('../');
var expect = chai.expect;
var _ = require('lodash');
var Promise = require('bluebird');
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

  it('should call right update one handler with mixed requirement for each system', function() {
    var updateOneHandler1 = sinon.spy(),
      updateOneHandler2 = sinon.spy(),
      updateOneHandler3 = sinon.spy();

    var stream = pipeline
      .pipe({
        require: ['c1'],
        updateOne: updateOneHandler1
      })
      .pipe({
        require: ['c2'],
        updateOne: updateOneHandler2
      })
      .pipe({
        require: ['c1', 'c2'],
        updateOne: updateOneHandler3
      });

    var e1 = world.e(['c1']);
    var e2 = world.e(['c2']);
    var e3 = world.e(['c1', 'c2']);

    stream.step(100);

    expect(updateOneHandler1).to.have.been.calledWith(e1, 100, world);
    expect(updateOneHandler1).to.have.been.calledWith(e3, 100, world);
    expect(updateOneHandler2).to.have.been.calledWith(e2, 100, world);
    expect(updateOneHandler2).to.have.been.calledWith(e3, 100, world);
    expect(updateOneHandler3).to.have.been.calledWith(e3, 100, world);
  });

  it('should call right before update  handler with mixed requirement for each system', function() {
    var updateOneHandler1 = sinon.spy(),
      updateOneHandler2 = sinon.spy(),
      updateOneHandler3 = sinon.spy();

    var stream = pipeline
      .pipe({
        require: ['c1'],
        beforeUpdate: updateOneHandler1
      })
      .pipe({
        require: ['c2'],
        beforeUpdate: updateOneHandler2
      })
      .pipe({
        require: ['c1', 'c2'],
        beforeUpdate: updateOneHandler3
      });

    var e1 = world.e(['c1']);
    var e2 = world.e(['c2']);
    var e3 = world.e(['c1', 'c2']);

    stream.step(100);

    expect(updateOneHandler1).to.have.been.calledWith(e1, 100, world);
    expect(updateOneHandler1).to.have.been.calledWith(e3, 100, world);
    expect(updateOneHandler2).to.have.been.calledWith(e2, 100, world);
    expect(updateOneHandler2).to.have.been.calledWith(e3, 100, world);
    expect(updateOneHandler3).to.have.been.calledWith(e3, 100, world);
  });

  it('should call right after update  handler with mixed requirement for each system', function() {
    var updateOneHandler1 = sinon.spy(),
      updateOneHandler2 = sinon.spy(),
      updateOneHandler3 = sinon.spy();

    var stream = pipeline
      .pipe({
        require: ['c1'],
        afterUpdate: updateOneHandler1
      })
      .pipe({
        require: ['c2'],
        afterUpdate: updateOneHandler2
      })
      .pipe({
        require: ['c1', 'c2'],
        afterUpdate: updateOneHandler3
      });

    var e1 = world.e(['c1']);
    var e2 = world.e(['c2']);
    var e3 = world.e(['c1', 'c2']);

    stream.step(100);

    expect(updateOneHandler1).to.have.been.calledWith(e1, 100, world);
    expect(updateOneHandler1).to.have.been.calledWith(e3, 100, world);
    expect(updateOneHandler2).to.have.been.calledWith(e2, 100, world);
    expect(updateOneHandler2).to.have.been.calledWith(e3, 100, world);
    expect(updateOneHandler3).to.have.been.calledWith(e3, 100, world);
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

  it('should mutate initial state by options passed to system builder', function() {
    var s = darling.system({
      getInitialState: function() {
        return {
          value1: 12345,
          value2: 'qwerty'
        };
      }
    });

    pipeline = pipeline.pipe(s({
      value1: 54321,
      value3: 'hello world'
    }));

    expect(pipeline.system.state).to.have.property('value1', 54321);
    expect(pipeline.system.state).to.have.property('value2', 'qwerty');
    expect(pipeline.system.state).to.have.property('value3', 'hello world');
  });

  describe('recipe', function() {
    it('should be in api', function() {
      expect(darling).to.have.property('recipe');
      expect(darling.recipe).to.have.property('sequence');
      expect(darling.recipe.sequence).to.be.a('function');
    });

    it('should add sequence of systems as object with property `systems`', function() {
      var handler1 = sinon.spy();
      var handler2 = sinon.spy();
      var handler3 = sinon.spy();

      var recipe = darling.recipe.sequence([
          {
            updateOne: handler1
          },
          {
            updateOne: handler2
          },
          {
            updateOne: handler3
          }
      ]);

      pipeline = pipeline.pipe(recipe());
      pipeline.step(100);

      expect(handler1).to.have.been.calledOnce;
      expect(handler2).to.have.been.calledOnce;
      expect(handler3).to.have.been.calledOnce;
    });
  });

  describe('laziness', function() {
    it('should call lazy update handlers as well ', function(done) {
      var promise = new Promise(function() {
      });
      var handler = sinon.stub().returns(promise);
      var stream = pipeline.pipe({
          lazy: true,
          updateAll: handler
        });

      stream.step(100);

      setTimeout(function() {
        expect(handler).to.have.been.calledOnce;
        done();
      }, 100);
    });

    it('should call lazy update all 1-by-1 and wait until previous will resolve', function(done) {
      var resolve1;
      var promise1 = new Promise(function(_resolve_) {
        resolve1 = _resolve_;
      });
      var promise2 = new Promise(function() {});

      var handler1 = sinon.stub().returns(promise1);
      var handler2 = sinon.stub().returns(promise2);
      var stream = pipeline
        .pipe({
          lazy: true,
          updateAll: handler1
        })
        .pipe({
          lazy: true,
          updateAll: handler2
        });

      stream.step(100);

      setTimeout(function() {
        expect(handler1).to.have.been.calledOnce;
        expect(handler2).to.not.have.been.called;
        resolve1();
        setTimeout(function() {
          expect(handler2).to.have.been.calledOnce;
          done();
        }, 100);
      }, 100);
    });

    it('should call lazy update one systems 1-by-1 and wait until previous will resolve', function(done) {
      var resolve1;
      var promise1 = new Promise(function(_resolve_) {
        resolve1 = _resolve_;
      });
      var promise2 = new Promise(function() {});

      var handler1 = sinon.stub().returns(promise1);
      var handler2 = sinon.stub().returns(promise2);
      var stream = pipeline
        .pipe({
          lazy: true,
          updateOne: handler1
        })
        .pipe({
          lazy: true,
          updateOne: handler2
        });

      stream.step(100);

      setTimeout(function() {
        expect(handler1).to.have.been.calledOnce;
        expect(handler2).to.not.have.been.called;
        resolve1();
        setTimeout(function() {
          expect(handler2).to.have.been.calledOnce;
          done();
        }, 100);
      }, 100);
    });

    it('should call lazy update one entities 1-by-1 and wait until previous will resolve', function(done) {
      var resolve1;
      var promise1 = new Promise(function(_resolve_) {
        resolve1 = _resolve_;
      });

      var handler1 = sinon.stub().returns(promise1);
      var stream = pipeline
        .pipe({
          lazy: true,
          updateOne: handler1
        });

      var emptyEntity2 = pipeline.e({});

      stream.step(100);

      setTimeout(function() {
        expect(handler1).to.have.been.calledOnce;
        expect(handler1).to.have.been.calledWith(emptyEntity, 100, world);
        expect(handler1).to.not.have.been.calledWith(emptyEntity2, 100, world);
        resolve1();
        setTimeout(function() {
          expect(handler1).to.have.been.calledWith(emptyEntity2, 100, world);
          done();
        }, 100);
      }, 100);
    });

    it('should call lazy before update systems 1-by-1 and wait until previous will resolve', function(done) {
      var resolve1;
      var promise1 = new Promise(function(_resolve_) {
        resolve1 = _resolve_;
      });
      var promise2 = new Promise(function() {});

      var handler1 = sinon.stub().returns(promise1);
      var handler2 = sinon.stub().returns(promise2);
      var stream = pipeline
        .pipe({
          lazy: true,
          beforeUpdate: handler1
        })
        .pipe({
          lazy: true,
          beforeUpdate: handler2
        });

      stream.step(100);

      setTimeout(function() {
        expect(handler1).to.have.been.calledOnce;
        expect(handler2).to.not.have.been.called;
        resolve1();
        setTimeout(function() {
          expect(handler2).to.have.been.calledOnce;
          done();
        }, 100);
      }, 100);
    });

    it('should call lazy after update systems 1-by-1 and wait until previous will resolve', function(done) {
      var resolve1;
      var promise1 = new Promise(function(_resolve_) {
        resolve1 = _resolve_;
      });
      var promise2 = new Promise(function() {});

      var handler1 = sinon.stub().returns(promise1);
      var handler2 = sinon.stub().returns(promise2);
      var stream = pipeline
        .pipe({
          lazy: true,
          afterUpdate: handler1
        })
        .pipe({
          lazy: true,
          afterUpdate: handler2
        });

      stream.step(100);

      setTimeout(function() {
        expect(handler1).to.have.been.calledOnce;
        expect(handler2).to.not.have.been.called;
        resolve1();
        setTimeout(function() {
          expect(handler2).to.have.been.calledOnce;
          done();
        }, 100);
      }, 100);
    });

    it('should return number of passed updates', function(done) {
      var resolve1 = null;
      var resolve2 = null;
      var stepHandler = sinon.spy();
      var handler1 = sinon.stub().returns(new Promise(function(_resolve_) {
        resolve1 = _resolve_;
      }));
      var handler2 = sinon.stub().returns(new Promise(function(_resolve_) {
        resolve2 = _resolve_;
      }));

      var stream = pipeline
        .pipe({
          lazy: true,
          afterUpdate: handler1
        })
        .pipe({
          lazy: true,
          afterUpdate: handler2
        });

      stream.step(100)
        .then(stepHandler);

      resolve1();
      resolve2();

      Promise
        .delay(100)
        .then(function() {
          expect(stepHandler).to.have.been.calledWith(2);
        })
        .done(done);
    });
  });
});
