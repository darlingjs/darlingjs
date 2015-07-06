/**
 * Project: darlingjs / GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

(function(darlingjs) {
    'use strict';
    var m = darlingjs.m('ng3D');


    /**
     * Component of position in 3D environment
     */
    m.$c('ng3D', {
        x: 0.0,
        y: 0.0,
        z: 0.0
    });

    /**
     * Component of parallax effect
     */
    m.$c('ngParallax', {
        //basis of parallax effect
        //1 is original plane, 0.5 - further, 0.25 - twice times further
        basis: 0.5
    });

    /**
     * Marker for converting 3D to tune parallax property
     */
    m.$c('ngConvert3DtoParallax');

    /**
     * Component of position in 3D environment
     */
    m.$c('ng3DSize', {
        width: 0.0,
        height: 0.0,
        depth: 0.0
    });

    /**
     * ngConvert3DtoParallax
     *
     * Use z to calculate basis of parallax effect.
     * Need recalculate each time z has changed
     *
     */
    m.$s('ngConvert3DtoParallax', {
        $require: ['ng3D', 'ngConvert3DtoParallax'],

        $addEntity: ['$entity', function($entity) {
            if (!$entity.ngParallax) {
                $entity.$add('ngParallax');
            }

            $entity.ngParallax.basis = 1 / (1 + $entity.ng3D.z);

            $entity.$remove('ngConvert3DtoParallax');
        }]
    });

    /**
     * ngSimpleParallax
     *
     * Apply parallax effect to calculate 2D position ng2D
     * by 3D position (ng3D), parallax basis (ngParallax) and look at position (ng2DViewPort).
     *
     */
    m.$s('ngSimpleParallax', {
        $require: ['ng3D', 'ngParallax'],

        $addEntity: ['$entity', function($entity) {
            if (!$entity.ng2D) {
                $entity.$add('ng2D');
            }
        }],

        $update: ['$entity', 'ng2DViewPort', function($entity, ng2DViewPort) {
            var ng3D = $entity.ng3D;
            var ng2D = $entity.ng2D;
            var basis = $entity.ngParallax.basis;
            ng2D.x = ng2DViewPort.lookAt.x + basis * (ng3D.x - ng2DViewPort.lookAt.x);
            ng2D.y = ng2DViewPort.lookAt.y + basis * (ng3D.y - ng2DViewPort.lookAt.y);
        }]
    });

    m.$s('ng3DShiftMovingSystem', {
        $require: ['ng3D', 'ngShiftMove'],

        $addEntity : function($entity) {
            $entity.ngShiftMove.dx = $entity.ngShiftMove.dx || 0.0;
            $entity.ngShiftMove.dy = $entity.ngShiftMove.dy || 0.0;
            $entity.ngShiftMove.dz = $entity.ngShiftMove.dz || 0.0;
        },

        $update: ['$entity', '$time', function($entity, $time) {
            $entity.ng3D.x += 0.001 * $entity.ngShiftMove.dx * $time;
            $entity.ng3D.y += 0.001 * $entity.ngShiftMove.dy * $time;
            $entity.ng3D.z += 0.001 * $entity.ngShiftMove.dz * $time;
        }]
    });
})(darlingjs);