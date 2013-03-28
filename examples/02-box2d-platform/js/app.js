/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */
//use Engine

/**
 * TODO: move to separate service to share between different controllers
 */
var box2DDebugDraw;
var world;

/**
 * Place Game View
 * @constructor
 */
function GameCtrl() {
    'use strict';

    var width = 640;
    var height = 480;

    world = darlingjs.world('myGame', ['ngModule', 'ngBox2D', 'ngPixijsIntegration'], {
        fps: 60
    });

    //world.$add('ngDOMSystem', { targetId: 'gameView' });
    world.$add('ngPixijsStage', { domId: 'gameView', width: width, height: height });
    world.$add('ngBox2DRollingControl');

    world.$add('ngBox2DSystem', {
        gravity: {
            x:0,
            y:10.0
        }
    });

    box2DDebugDraw = world.$add('ngBox2DDebugDraw', {
        domID: 'gameView', width: width, height: height
    });

    world.$add('ngBox2DDraggable', { domId: 'gameView', width: width, height: height });

    world.$add(world.$e('player', [
        'ngDOM', { color: 'rgb(0,200,200)' },
        'ngSprite', { name: 'assets/bunny.png', anchor: {y: 0.8} },
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
    /*

    for (var i = 0, l = 30; i < l; i++) {
        var fixed = Math.random() > 0.5;
        var boxType = Math.floor(1 + 3 * Math.random());
        world.$add(world.$e('obstacle_' + i, [
            'ngDOM', { color: fixed?'rgb(0, 255, 0)':'rgb(200, 200, 0)'},
            //Get From : http://www.iconfinder.com/search/?q=iconset%3Aie_ICandies
            'ngSprite', { name: 'assets/box' + boxType + '.png', fitToSize: true },
            'ng2D', {x : 10 + (width - 20) * Math.random(), y: 10 + (height - 20) * Math.random()},
            'ng2DSize', {width:30, height:30},
            'ng2DRotation',
            'ngPhysic'
        ]));
    }
    */

    /*

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

    */

    loadMap('assets/map.json')
        .then(parseMap);


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
}

/**
 * Game State Controller
 * * show state;
 * * control behaviour;
 *
 * @param $scope
 * @constructor
 */
function GameStateCtrl($scope) {
    $scope.box2dDebugVisible = true;
    $scope.$watch('box2dDebugVisible', function(value) {
        box2DDebugDraw.showDebugDrawVisible(value);
    });

    $scope.worldIsPlaying = true;
    $scope.$watch('worldIsPlaying', function(value) {
        if(value) {
            world.$start();
        } else {
            world.$stop();
        }
    });

    $scope.restartWorld = function() {
        //TODO:...
    };
}

/**
 *
 * @param file
 * @return Promise https://github.com/kriskowal/q
 */
function loadMap(file) {
    var deferred = Q.defer();
    var oReq = new XMLHttpRequest();
    oReq.onload = function(data) {
        deferred.resolve(JSON.parse(data.target.response));
    };

    //TODO: handle error
    //deferred.reject(new Error(error));
    oReq.open("get", file, true);
    oReq.send();

    return deferred.promise;
}

function convertTiledPropertiesToComponentx(properties) {
    //TODO:
    return {};
}

function parseMap(data) {
    //data.tilesets[0]
    for(var j = 0, li = data.layers.length; j < li; j++) {
        var layer = data.layers[j];
        switch(layer.type) {
            case 'tilelayer':
                //TODO: Do we really need to transform flat array to separate entities?
                //layer.data;
                break;
            case 'imagelayer':
                //TODO: whole image.
                break;
            case 'objectgroup':

                for(var i = 0, li = layer.objects.length; i < li; i++) {
                    var object = layer.objects[i];
                    var components = {};

                    components = convertTiledPropertiesToComponentx(object.properties);

                    switch(object.type) {
                        case 'static':
                            components.ngPhysic = {type: 'static', restitution: 0.0};
                            break;
                        case 'dynamic':
                            components.ngPhysic = {};
                            break;
                        case '':
                            //TODO:
                            continue;
                            break;
                        default:
                            throw new Error('Need to implement new object type : "' + object.type + '"');
                            break;
                    }

                    components.ng2D = {
                        x: object.x,
                        y: object.y
                    };

                    if (object.ellipse) {
                        //Because Box2D can't interact with ellipse we just take average value
                        components.ng2DCircle = {
                            radius: 0.25 * (object.width + object.height)
                        };
                    } else if (object.polyline) {
                        //TODO : create complex shape
                        //object.polyline[].{x,y};// custom shape
                        components.ng2DPolygon = {
                            line: object.polyline
                        };
                        continue;
                    } else if (object.polygon) {
                        components.ng2DPolygon = {
                            line: object.polygon
                        };
                    } else {
                        components.ng2DSize = {
                            width: object.width,
                            height: object.height
                        };

                        components.ng2D.x += 0.5 * object.width;
                        components.ng2D.y += 0.5 * object.height;
                    }

                    world.$add(
                        world.$e(object.name, components)
                    );
                }
                break;
        }
    }
}