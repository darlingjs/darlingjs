var expect = require('chai').expect;
var wrap = require('../../utils').wrap;

describe('util', function() {
  describe('wrap', function() {
    var wrapped;
    var wrapper;

    beforeEach(function() {
      wrapped = {
        f1: function() {
          return this;
        },

        f2: function() {
          return this;
        }
      };

      wrapper = {
        f3: function() {
          return this;
        }
      };
    });

    it('should forward methods of target to wrapper', function() {
      wrap(wrapped, wrapper);
      expect(wrapper).to.have.property('f1');
      expect(wrapper.f1).to.be.a('function');
      expect(wrapper).to.have.property('f2');
      expect(wrapper.f2).to.be.a('function');
    });

    it('should keep wrapper original methods', function() {
      var orgFunc = function() {};
      wrapper.f2 = orgFunc;
      wrap(wrapped, wrapper);
      expect(wrapper.f2).to.be.equal(orgFunc);
    });

    it('should keep this of function equal to target', function() {
      wrap(wrapped, wrapper);

      expect(wrapper.f1()).to.be.equal(wrapped);
      expect(wrapper.f2()).to.be.equal(wrapped);
      expect(wrapper.f3()).to.be.equal(wrapper);
    });

    it('should pass by undefined or null target', function() {
      wrap(null, wrapper);
      expect(wrapper).to.not.have.property('f1');
      expect(wrapper).to.not.have.property('f2');
      expect(wrapper).to.have.property('f3');
    });

    it('should return wrapper', function() {
      expect(wrap(wrapped, wrapper)).to.equal(wrapper);
    });

    it('should wrap instance of classes as well', function() {
      var SomeClass = function() {};
      SomeClass.prototype.f1 = function() {};
      SomeClass.prototype.f2 = function() {};
      wrapped = new SomeClass();

      wrap(wrapped, wrapper);

      expect(wrapper).to.have.property('f1');
      expect(wrapper.f1).to.be.a('function');
      expect(wrapper).to.have.property('f2');
      expect(wrapper.f2).to.be.a('function');
    });
  });
});
