'use strict';
/**
 * Project: darlingjs / GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

describe('flatland', function() {
    var world;

    beforeEach(function() {
        world = darlingjs.world('theWorld', ['ngFlatland']);
    });

    afterEach(function() {
        darlingjs.removeWorld(world);
    });

    describe('ngMovingSystem', function() {
        beforeEach(function() {
            world.$add('ngMovingSystem');
        });

        it('should move ng2D on update', function() {
            var e = world.$add(
                world.$e({
                    'ng2D': {
                        x: 0.0,
                        y: 0.0
                    },
                    'ngMove': {
                        dx: 0.1,
                        dy: 0.2
                    }
                })
            );

            world.$update(2000);

            expect(e.ng2D.x).toBe(0.2);
            expect(e.ng2D.y).toBe(0.4);
        });
    });
});