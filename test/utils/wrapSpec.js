var expect = require('chai').expect;
var wrap = require('../../utils').wrap;

describe('util', function() {
  describe('wrap', function() {
    var wrapper;
    var wrapped;

    beforeEach(function() {
      wrapper = {
        f1: function() {
          return this;
        },

        f2: function() {
          return this;
        }
      };

      wrapped = {
        f3: function() {
          return this;
        }
      };
    });

    it('should forward methods of target to wrapper', function() {
      wrap(wrapped, wrapper);
      expect(wrapped).to.have.property('f1');
      expect(wrapped.f1).to.be.a('function');
      expect(wrapped).to.have.property('f2');
      expect(wrapped.f2).to.be.a('function');
    });

    it('should keep wrapper original methods', function() {
      var orgFunc = function() {};
      wrapped.f2 = orgFunc;
      wrap(wrapped, wrapper);
      expect(wrapped.f2).to.be.equal(orgFunc);
    });

    it('should keep this of function equal to target', function() {
      wrap(wrapped, wrapper);

      expect(wrapped.f1()).to.be.equal(wrapper);
      expect(wrapped.f2()).to.be.equal(wrapper);
      expect(wrapped.f3()).to.be.equal(wrapped);
    });

    it('should pass by undefined or null target', function() {
      wrap(wrapped, null);
      expect(wrapped).to.not.have.property('f1');
      expect(wrapped).to.not.have.property('f2');
      expect(wrapped).to.have.property('f3');
    });

    it('should return wrapper', function() {
      expect(wrap(wrapped, wrapper)).to.equal(wrapped);
    });

    it('should wrap instance of classes as well', function() {
      var SomeClass = function() {};
      SomeClass.prototype.f1 = function() {};
      SomeClass.prototype.f2 = function() {};
      wrapper = new SomeClass();

      wrap(wrapped, wrapper);

      expect(wrapped).to.have.property('f1');
      expect(wrapped.f1).to.be.a('function');
      expect(wrapped).to.have.property('f2');
      expect(wrapped.f2).to.be.a('function');
    });
  });
});
