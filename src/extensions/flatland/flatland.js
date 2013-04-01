/**
 * Project: DarlingJS
 *
 * Flatland Extensions (2D).
 * Inspired by http://en.wikipedia.org/wiki/Flatland
 *
 * Copyright (c) 2013, Eugene-Krevenets
 */

(function(darlingjs) {
    'use strict';

    var module = darlingjs.module('ngFlatland');

    module.$c('ng2D', {
        x: 0.0,
        y: 0.0
    });

    module.$c('ng2DSize', {
        width: 10.0,
        height: 10.0
    });

    module.$c('ng2DRotation', {
        rotation: 0.0
    });

    module.$c('ng2DCircle', {
        radius: 10.0
    });

    module.$c('ng2DPolygon', {
        line: null
    });

    //Markers or State in FiniteStateMachine
    module.$c('ngGoingLeft', {});
    module.$c('ngGoingRight', {});

    //Service
    module.$s('ng2DViewPort', {
        lookAt: {x:0.0, y:0.0}
    });
})(darlingjs);