'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

describe('box2dEmscriptenAdapter', function() {
    var world;
    beforeEach(function() {
        world = darlingjs.world('myWorld', ['ngFlatland', 'ngPhysics', 'ngBox2DEmscripten']);
    });

    afterEach(function() {
        darlingjs.removeAllWorlds();
    });

    xit('should get bodies at x,y', function() {
        var box2d = world.$add('ngBox2DSystem');

        world.$e('entity1', {
            'ng2D': {x:-10.0, y:0.0},
            'ng2DSize': {width:30, height:30},
            'ngPhysic': {}
        });

        world.$e('entity2', {
            'ng2D': {x:10.0, y:0.0},
            'ng2DSize': {width:30, height:30},
            'ngPhysic': {}
        });

        var bodies = box2d.getBodiesAt(0, 0);
        expect(bodies).toBeDefined();
        expect(bodies.length).toBe(2);
    });

    xit('should joint two entity by position of revolve joint', function() {
        world.$add('ngBox2DSystem');
        world.$add('ngBox2DRevoluteJoint');

        world.$e('entity1', {
            'ng2D': {x:-10.0, y:0.0},
            'ng2DSize': {width:30, height:30},
            'ngPhysic': {}
        });

        world.$e('entity2', {
            'ng2D': {x:10.0, y:0.0},
            'ng2DSize': {width:30, height:30},
            'ngPhysic': {}
        });

        world.$e('jointEntity', {
            'ng2D': {x:0.0, y:0.0},
            'ngRevoluteJoint':{}
        });
    });
});
