(function() {

'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */
//use Engine

    var world = darlingjs.world('myGame', ['ngModule'], {
        fps: 60
    });

    world.$add('ngDOMSystem', { targetId: 'gameTarget' });
    world.$add('ngControlSystem');
    world.$add('ng2DRamble');
    world.$add('ng2DCollisionSystem');
    //world.$add('ngFlatControlSystem');

    world.$add(world.$e('player', [
        'ngDOM', { color: 'rgb(0,200,200)' },
        'ng2D', {x : 0, y: 50, width:10, height:10},
        'ngControl',
        'ngCollision'
    ]));

    for (var i = 0, l = 10; i < l; i++) {
        var fixed = Math.random() > 0.5;
        world.$add(world.$e('obstacle_' + i, [
            'ngDOM', { color: fixed?'rgb(0, 255, 0)':'rgb(200, 200, 0)'},
            'ng2D', {x : 10 + 80 * Math.random(), y: 10 + 80 * Math.random(), width:10, height:10},
            'ngCollision', {fixed: fixed}
        ]));
    }

    world.$add(world.$e('goblin', [
        'ngDOM', { color: 'rgb(255,0,0)' },
        'ng2D', {x : 99, y: 50},
        'ngRamble', {frame: {
            left: 50, right: 99,
            top: 0, bottom: 99
        }},
        'ngScan', {
            radius: 3,
            target: 'ngPlayer',
            switchTo: {
                e:'ngAttack',
                params: {
                    switchTo:'ngRamble'
                }
            }
        },
        'ngCollision'
    ]));

    world.$start();
})();