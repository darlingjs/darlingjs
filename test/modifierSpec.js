'use strict';

var darling = require('../');
var modify = require('../lib/core/modifier').modify;
var revert = require('../lib/core/modifier').revert;

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

chai.use(sinonChai);

describe('modifier', function() {
  var w;

  beforeEach(function() {
    w = darling.w();
  });

  describe('modify', function() {
    it('should execute modifier function on apply', function() {
      var modifier = sinon.spy();
      var e = w.e('theEntity');
      modify(e, modifier);
      expect(modifier).to.have.been.calledOnce;
    });

    it('should add component on apply', function() {
      var e = w.e('theEntity');
      modify(e, 'theComponent');
      expect(e.has('theComponent')).to.be.true;
    });

    it('should add component from array of component names on apply', function() {
      var e = w.e('theEntity');
      modify(e, ['theComponent1', 'theComponent2']);
      expect(e.has('theComponent1')).to.be.true;
      expect(e.has('theComponent2')).to.be.true;
    });

    it('should add component from object with key - component name, value - is config on apply', function() {
      var e = w.e('theEntity');
      modify(e, {
        theComponent1: {
          z: 10
        },
        theComponent2: {
          x: 777
        }
      });
      expect(e.has('theComponent1')).to.be.true;
      expect(e.theComponent1.z).to.be.equal(10);
      expect(e.has('theComponent2')).to.be.true;
      expect(e.theComponent2.x).to.be.equal(777);
    });

    it('should use result of executed modifier to recursive modify', function(){
      var e = w.e('theEntity');
      modify(e, function() {
        return ['theComponent1', 'theComponent2'];
      });

      expect(e.has('theComponent1')).to.be.true;
      expect(e.has('theComponent2')).to.be.true;
    });

    it('should use result of object of components callback function as config of component', function(){
      var e = w.e('theEntity');
      modify(e, {
        theComponent1: function() {
          return {
            x: 1,
            y: 2
          };
        },
        theComponent2: function() {
          return {
            x: 3,
            y: 4
          };
        }});

      expect(e.has('theComponent1')).to.be.true;
      expect(e.theComponent1.x).to.be.equal(1);
      expect(e.theComponent1.y).to.be.equal(2);
      expect(e.has('theComponent2')).to.be.true;
      expect(e.theComponent2.x).to.be.equal(3);
      expect(e.theComponent2.y).to.be.equal(4);
    });

    it('should use result of array of components callback function as config of component', function(){
      var e = w.e('theEntity');
      modify(e, [function() {
        return 'theComponent1';
      }, function() {
        return 'theComponent2';
      }]);

      expect(e.has('theComponent1')).to.be.true;
      expect(e.has('theComponent2')).to.be.true;
    });
  });

  describe('revert', function() {
    it('shouldn\'t execute modifier function on revert', function() {
      var modifier = sinon.spy();
      var e = w.e('theEntity');
      revert(e, modifier);
      expect(modifier).to.not.have.been.calledOnce;
    });

    it('should remove component on revert', function() {
      var e = w.e('theEntity');
      e.add('theComponent');
      revert(e, 'theComponent');
      expect(e.has('theComponent')).to.not.be.true;
    });

    it('should remove component from array of component names on revert', function() {
      var e = w.e('theEntity');
      e.add('theComponent1');
      e.add('theComponent2');
      e.add('theComponent3');
      revert(e, ['theComponent1', 'theComponent2']);
      expect(e.has('theComponent1')).to.be.false;
      expect(e.has('theComponent2')).to.be.false;
      expect(e.has('theComponent3')).to.be.true;
    });


    it('should remove component from object with key - component name, value - is config on revert', function() {
      var e = w.e('theEntity', ['theComponent1', 'theComponent2']);
      revert(e, {
        theComponent1: true,
        theComponent2: true
      });
      expect(e.has('theComponent1')).to.be.false;
      expect(e.has('theComponent2')).to.be.false;
    });
  });
});
