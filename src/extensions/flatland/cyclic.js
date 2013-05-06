/**
 * Project: darlingjs / GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

(function(darlingjs, darlingutil) {
    'use strict';

    var m = darlingjs.m('ngCyclic');

    var outsideConfig = {
        handler: function($entity, leftEdge, rightEdge, topEdge, bottomEdge) {
            var addInsideConfig = false;
            if (leftEdge) {
                $entity.ng3D.x += $entity.ngCyclic.patternWidth;
                addInsideConfig = true;
            } else if (rightEdge) {
                $entity.ng3D.x -= $entity.ngCyclic.patternWidth;
                addInsideConfig = true;
            }

            if (bottomEdge) {
                $entity.ng3D.y -= $entity.ngCyclic.patternHeight;
                addInsideConfig = true;
            } else if (topEdge) {
                $entity.ng3D.y += $entity.ngCyclic.patternHeight;
                addInsideConfig = true;
            }

            if (addInsideConfig && !$entity.ngMarkIfInsideOfTheViewPort) {
                $entity.$add('ngMarkIfInsideOfTheViewPort', insideConfig);
            }
        }
    };

    var insideConfig = {
        marker: {
            ngMarkIfOutsideOfTheViewPort: outsideConfig
        }
    };


    m.$c('ngCyclic', {
        group: 'mountains',

        step: {
            width: 100.0,
            height: 100.0
        },

        leftRight: true,
        topBottom: true
    });

    m.$s('ngCyclic3DLayer', {
        $require: ['ngCyclic', 'ng3D'],

        $addEntity: ['$entity', function($entity) {
            $entity.$add('ngMarkIfInsideOfTheViewPort', insideConfig);
            $entity.$add('ngMarkIfOutsideOfTheViewPort', outsideConfig);
        }],

        $removeEntity: ['$entity', function($entity) {
        }]
    });

})(darlingjs, darlingutil);