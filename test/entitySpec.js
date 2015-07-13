/* eslint no-unused-expressions: [0]*/

'use strict';

var Entity = require('../lib/core/entity');

var chai = require('chai');
var darling = require('../');
var expect = require('chai').expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

chai.use(sinonChai);

describe('entity', function() {
  describe('by itself', function() {
    var e;

    beforeEach(function() {
      e = new Entity();
    });

    it('should throw exception on add null component', function() {
      expect(function() {
        e.add(null);
      }).to.throw();
    });

    it('should add component on add', function() {
      e.add('component');

      expect(e).to.have.property('component');
      expect(e.component).to.be.ok;
    });
  });

  describe('in the World context', function() {
    var w;

    beforeEach(function() {
      w = darling.w();
      darling.c('theComponent', {
        x: 11,
        z: 99
      });
    });

    describe('create entity', function() {
      it('should be able to define components as array', function() {
        var e = w.e('e', ['c1', 'c2']);
        expect(e.has('c1')).to.be.true;
        expect(e.has('c2')).to.be.true;
      });
    });

    it('should use predefined components', function() {
      var e = w.e();

      e.add('theComponent');

      expect(e).to.have.property('theComponent');
      expect(e.theComponent).to.have.property('x', 11);
      expect(e.theComponent).to.have.property('z', 99);
    });

    it('should override properties of components', function() {
      var e = w.e();

      e.add('theComponent', {
        x: 10
      });

      expect(e).to.have.property('theComponent');
      expect(e.theComponent).to.have.property('x', 10);
      expect(e.theComponent).to.have.property('z', 99);
    });

    it('should has component after it was added', function() {
      var e = w.e();
      e.add('theComponent');

      expect(e.has('theComponent')).to.be.true;
    });

    it('should add component as array', function() {
      var e = w.e();
      e.add(['c1', 'c2']);

      expect(e.has('c1')).to.be.true;
      expect(e.has('c2')).to.be.true;
    });

    it('should has component after it was added can check by component', function() {
      var e = w.e();
      var c = darling.c('theComponent', {});

      e.add('theComponent');

      expect(e.has(c)).to.be.true;
    });

    it('should be able to remove component', function() {
      var e = w.e('theEntity');
      e.add('theComponent');
      e.remove('theComponent');

      expect(e.has('theComponent')).to.be.false;
      expect(e.theComponent).to.not.be.ok;
    });

    it('should trigger event after add component', function() {
      var e = w.e('theEntity');
      var handler = sinon.spy();
      e.on('add', handler);
      var c = e.add('theComponent');

      expect(handler).to.have.been.calledOnce;
      expect(handler).to.have.been.calledWith(e, c);
    });

    it('should trigger event after remove component', function() {
      var e = w.e('theEntity');
      var handler = sinon.spy();
      e.on('remove', handler);

      e.remove('theComponent');

      expect(handler).to.not.been.called;

      var c = e.add('theComponent');
      e.remove('theComponent');

      expect(handler).to.been.calledOnce;
      expect(handler).to.been.calledWith(e, c);
    });

    it('should set component _name if it is predefined', function() {
      var e = w.e('theEntity');
      var c = e.add('theComponent');
      expect(c).to.have.property('_name').to.be.equal('theComponent');
    });

    it('should set component _name if it is not predefined', function() {
      var e = w.e('theEntity');
      var c = e.add('unknownComponent');
      expect(c).to.have.property('_name').to.be.equal('unknownComponent');
    });

    it('should add component by instance', function() {
      var c = darling.c('theComponent', {});
      var e = w.e('theEntity');
      e.add(c);
      expect(e.has(c)).to.be.true;
    });
  });
});
