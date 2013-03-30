'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

describe('box2dModule', function() {
    var world;
    beforeEach(function() {
        world = darlingjs.world('myWorld', ['ngFlatland', 'ngBox2D']);
    });

    afterEach(function() {
        darlingjs.removeAllWorlds();
    });

    it('should joint two entity by revolve joint', function() {
        world.$add('ngBox2DSystem');
        world.$add('ngRevoluteJoint');

        world.$add(
            world.$e('entity1', {
                'ng2D': {x:0.0, y:0.0},
                'ng2DSize': {width:30, height:30},
                'ngPhysic': {}
            })
        );

        world.$add(
            world.$e('entity2', {
                'ng2D': {x:0.0, y:0.0},
                'ng2DSize': {width:30, height:30},
                'ngPhysic': {}
            })
        );
    });
});