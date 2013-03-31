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

    var width = 800;
    var height = 600;

    world = darlingjs.world('myGame', ['ngModule', 'ngFlatland', 'ngBox2D', 'ngPixijsIntegration'], {
        fps: 60
    });

    world.$add('ngBox2DRollingControl');

    world.$add('ngBox2DSystem', {
        gravity: {
            x:0,
            y:10.0
        }
    });

    world.$add('ngBox2DRevoluteJoint');


    world.$add('ngPixijsStage', { domId: 'gameView', width: width, height: height });
    world.$add('ngPixijsSheetSprite');
    world.$add('ngPixijsSprite');
    world.$add('ngPixijsMovieClip');

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
    for (var i = 0, l = 50; i < l; i++) {
        var fixed = Math.random() > 0.5;
        var boxType = Math.floor(1 + 3 * Math.random());
        world.$add(world.$e('obstacle_' + i, {
//            'ngDOM': { color: fixed?'rgb(0, 255, 0)':'rgb(200, 200, 0)'},
            //Get From : http://www.iconfinder.com/search/?q=iconset%3Aie_ICandies
//            'ngSprite': { name: 'assets/box' + boxType + '.png', fitToSize: true },
            'ngSpriteAtlas' : { name: 'box' + boxType + '.png', url: 'assets/spritesheet.json', fitToSize: true},
//            'ngMovieClip' : {url: 'assets/explosion.json', fitToSize: true, frames: ['Explosion_Sequence_A 1.png', 'Explosion_Sequence_A 2.png', 'Explosion_Sequence_A 3.png', 'Explosion_Sequence_A 4.png', 'Explosion_Sequence_A 5.png', 'Explosion_Sequence_A 6.png', 'Explosion_Sequence_A 7.png', 'Explosion_Sequence_A 8.png', 'Explosion_Sequence_A 9.png', 'Explosion_Sequence_A 10.png', 'Explosion_Sequence_A 11.png', 'Explosion_Sequence_A 12.png', 'Explosion_Sequence_A 13.png', 'Explosion_Sequence_A 14.png', 'Explosion_Sequence_A 15.png', 'Explosion_Sequence_A 16.png', 'Explosion_Sequence_A 17.png', 'Explosion_Sequence_A 18.png', 'Explosion_Sequence_A 19.png', 'Explosion_Sequence_A 20.png', 'Explosion_Sequence_A 21.png', 'Explosion_Sequence_A 22.png', 'Explosion_Sequence_A 23.png', 'Explosion_Sequence_A 24.png', 'Explosion_Sequence_A 25.png', 'Explosion_Sequence_A 26.png', 'Explosion_Sequence_A 27.png']},
            'ng2D': {x : 10 + (width - 20) * Math.random(), y: 10 + (height - 20) * Math.random()},
            'ng2DSize': {width:30, height:30},
            'ng2DRotation': {},
            'ngPhysic': {}
        }));
    }
    /*
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

function convertTiledPropertiesToComponents(properties) {
    var components = {};
    for (var key in properties) {
        var params = key.split('.');
        var componentParam = components;
        var previousParam;
        if (params.length === 0) {
            previousParam = key;
        } else {
            for (var i = 0, l = params.length - 1; i < l; i++) {
                previousParam = params[i];
                if (!componentParam.hasOwnProperty(previousParam)) {
                    componentParam[previousParam] = {};
                }

                componentParam = componentParam[previousParam];
            }
            previousParam = params[i];
        }

        if (previousParam === '') {
            continue;
        }
        var value = properties[key];
        if(value === 'true') {
            componentParam[previousParam] = true;
        } else if(value === 'false') {
            componentParam[previousParam] = false;
        } else if (isNaN(value)) {
            componentParam[previousParam] = properties[key];
        } else {
            componentParam[previousParam] = Number(value);
        }
    }

    return components;
}

function parseTileLayerData(data, width, height, components) {
    var tileWidth = components.ng2DSize.width;
    var tileHeight = components.ng2DSize.height;
    for (var i = 0, l = data.length; i < l; i++) {
        var tileId = data[i];
        var x = i % width;
        var y = Math.floor(i / width);
        components.ng2D.x = x * tileWidth;
        components.ng2D.y = y * tileHeight;
        components.ngTileSprite.tileId = tileId;

//        TODO : check - how to show part of image.
//        world.$add(
//            world.$e(tileId, components)
//        );
    }
}

function parseMap(data) {
    //data.tilesets[0]
    try {
        for(var j = 0, lj = data.layers.length; j < lj; j++) {
            var layer = data.layers[j];
            switch(layer.type) {
                case 'tilelayer':
                    //TODO: Do we really need to transform flat array to separate entities?
//                var tile = data.tilesets[0];
//                parseTileLayerData(layer.data, layer.width, layer.height, {
//                    ng2D: {x:0, y:0},
//                    ng2DSize: {width:tile.tilewidth, height:tile.tileheight},
//                    ngTileSprite: {tilesheetUrl: 'assets/' + tile.image, tileId: 0}
//                });
                    break;
                case 'imagelayer':
                    //TODO: whole image.
                    break;
                case 'objectgroup':

                    for(var i = 0, li = layer.objects.length; i < li; i++) {
                        var object = layer.objects[i];
                        var components = {};

                        components = convertTiledPropertiesToComponents(object.properties);

                        switch(object.type) {
                            case 'static':
                                if (components.ngPhysic) {
                                    components.ngPhysic.type = 'static';
                                    components.ngPhysic.restitution = 0.0;
                                } else {
                                    components.ngPhysic = {type: 'static', restitution: 0.0};
                                }
                                break;
                            case 'dynamic':
                                if (components.ngPhysic) {
                                    components.ngPhysic.type = 'dynamic';
                                } else {
                                    components.ngPhysic = {type: 'dynamic'};
                                }
                                break;
                            case 'joint':
                                components.ngRevoluteJoint = {};
                                break;
                            case '':
                                //TODO:
                                console.log('undefined object', object);
                                continue;
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
                            components.ng2D.x+= 0.5 * object.width;
                            components.ng2D.y+= 0.5 * object.height;
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
    } catch(e) {
        console.log(e);
    }
}