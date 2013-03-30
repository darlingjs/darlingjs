'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

describe('box2dModule', function() {
    var world;
    beforeEach(function() {
        world = darlingjs.world('myWorld', ['ngBox2D']);
    });

    afterEach(function() {
        darlingjs.removeAllWorlds();
    });

    it('should', function() {
        world.$s('ngRevoluteJoint');
    });
});