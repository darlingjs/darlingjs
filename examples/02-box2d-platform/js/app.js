(function() {

'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */
//use Engine

    var width = 640;
    var height = 480;

    var world = darlingjs.world('myGame', ['ngModule', 'ngBox2D', 'ngPixijsIntegration'], {
        fps: 60
    });

    //world.$add('ngDOMSystem', { targetId: 'gameView' });
    world.$add('ngPixijsStage', { targetId: 'gameView' });
    world.$add('ngBox2DRollingControl');
    world.$add('ngBox2DSystem', {
        debugDrawDOMId: 'gameView',
        gravity: {
            x:0,
            y:10.0
        }
    });
    world.$add('ngBox2DDraggable', { targetId: 'gameView' });


    world.$add(world.$e('player', [
        'ngDOM', { color: 'rgb(0,200,200)' },
        'ngSprite', { name: 'assets/bunny.png' },
        'ng2D', {x : 50, y: 50},
        'ng2DCircle', {radius: 10.0},
        //'ng2DRotation',
        'ngControlPlatformStyle', {
            runSpeed: 4.0,
            jumpSpeed: 5.0,
            flySpeed: 0.0, //0.05,
            doubleJump: 2,
            speed: 100.0
        },
        'ngDraggable',
        'ngPhysic', {
            restitution: 0.0,
            friction: 200.0,
            density: 1.0
        }
    ]));

    for (var i = 0, l = 3; i < l; i++) {
        var fixed = Math.random() > 0.5;
        world.$add(world.$e('obstacle_' + i, [
            'ngDOM', { color: fixed?'rgb(0, 255, 0)':'rgb(200, 200, 0)'},
            'ng2D', {x : 10 + (width - 20) * Math.random(), y: 10 + (height - 20) * Math.random()},
            'ng2DSize', {width:30, height:30},
            'ng2DRotation',
            'ngPhysic'
        ]));
    }

    world.$add(world.$e('ground', [
        'ng2D', {x: width / 2, y: height},
        'ng2DSize', {width:width, height:10},
        'ngPhysic', {type: 'static', restitution: 0.0}
    ]));

    world.$add(world.$e('ground-slope', [
        'ng2D', {x: width / 2, y: height - 40},
        'ng2DSize', {width:width / 2, height:10.0},
        'ng2DRotation', {rotation: 15.0 * Math.PI / 180},
        'ngPhysic', {type: 'static', restitution: 0.0}
    ]));

    world.$add(world.$e('ground-hill', [
        'ng2D', {x: width / 8 + 10, y: height - 80},
        'ng2DSize', {width:width / 4, height:10.0},
        'ngPhysic', {type: 'static', restitution: 0.0}
    ]));

    world.$add(world.$e('top-frame', [
        'ng2D', {x: width / 2, y: 0.0},
        'ng2DSize', {width:width, height:10},
        'ngPhysic', {type: 'static', restitution: 0.0}
    ]));

    world.$add(world.$e('left-frame', [
        'ng2D', {x: 0.0, y: height / 2},
        'ng2DSize', {width:10, height:height},
        'ngPhysic', {type: 'static', restitution: 0.0}
    ]));

    world.$add(world.$e('right-frame', [
        'ng2D', {x: width, y: height / 2},
        'ng2DSize', {width:10, height:height},
        'ngPhysic', {type: 'static', restitution: 0.0}
    ]));

    /*
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
    ]));*/

    world.$start();
})();