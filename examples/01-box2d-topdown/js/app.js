(function() {

'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */
//use Engine

    var world = darlingjs.world('myGame', ['ngModule', 'ngBox2D'], {
        fps: 60
    });

    world.$add('ngDOMSystem', { targetId: 'gameTarget' });
    world.$add('ngControlSystem');
    world.$add('ng2DRamble');
    world.$add('ngBox2DSystem', {
        domID: 'canvas',
        gravity: {
            x:0,
            y:0.0
        }
    });
//    world.$add('ngBox2DRollingControl');
    world.$add('ngBox2DLinearControl');

    world.$add(world.$e('player', [
        'ngDOM', { color: 'rgb(0,200,200)' },
        'ng2D', {x : 50, y: 50},
        'ng2DSize', {width:10, height:10},
        'ngControl', {speed: 100.0},
        'ngPhysic'
    ]));

    for (var i = 0, l = 10; i < l; i++) {
        var fixed = Math.random() > 0.5;
        world.$add(world.$e('obstacle_' + i, [
            'ngDOM', { color: fixed?'rgb(0, 255, 0)':'rgb(200, 200, 0)'},
            'ng2D', {x : 10 + 80 * Math.random(), y: 10 + 80 * Math.random()},
            'ng2DSize', {width:10, height:10},
            'ngPhysic'
        ]));
    }

    world.$add(world.$e('ground', [
        'ng2D', {x: 100.0, y: 200.0},
        'ng2DSize', {width:200, height:10},
        'ngPhysic', {type: 'static'}
    ]));

    world.$add(world.$e('top-frame', [
        'ng2D', {x: 100.0, y: 0.0},
        'ng2DSize', {width:200, height:10},
        'ngPhysic', {type: 'static'}
    ]));

    world.$add(world.$e('left-frame', [
        'ng2D', {x: 0.0, y: 100.0},
        'ng2DSize', {width:10, height:200},
        'ngPhysic', {type: 'static'}
    ]));

    world.$add(world.$e('right-frame', [
        'ng2D', {x: 200.0, y: 100.0},
        'ng2DSize', {width:10, height:200},
        'ngPhysic', {type: 'static'}
    ]));

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