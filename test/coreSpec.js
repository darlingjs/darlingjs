'use strict';

var core = require('../lib/core/index.js');
var Pipeline = require('../lib/core/pipeline');

var expect = require('chai').expect;

describe('core', function () {
  it('should return stream on world()', function () {
    var w = core.world();
    expect(w).to.be.instanceOf(Pipeline);
  });

  it('should return different instances on world()', function() {
    var w1 = core.world();
    var w2 = core.world();
    expect(w1).to.not.equal(w2);
  });

  describe('system constructor', function() {
    it('should create system constructor on system()', function() {
      var c = core.system();
      expect(c).to.not.be.undefined;
    });

    it('should create instance of system', function() {
      var c = core.system();
      var s = c();
      expect(s).to.not.be.undefined;
    });
  });

  afterEach(function() {
    core.removeAllWorlds();
  });
});
