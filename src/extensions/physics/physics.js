/**
 * Project: darlingjs / GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

(function(darlingjs) {
    'use strict';

    var m = darlingjs.module('ngPhysics');

    m.$c('ngPhysic', {
        type: 'dynamic', //static
        restitution: 0.5,
        friction: 0.75,
        density: 1.0,
        fixedRotation: false
    });

    m.$c('ngFixedRotation', {});

    m.$c('ngPrismaticJoint', {
        lowerTransition: 0.0,
        upperTranslation: 0.0,
        enableLimit: false,
        maxMotorForce: 100.0,
        motorSpeed: 5.0,
        enableMotor: false
    });

    m.$c('ngDistanceJoint', {
        collideConnected: true,
        frequencyHz: 4.0,
        dampingRatio: 0.5
    });

    m.$c('ngPulleyJoint', {
    });

    m.$c('ngRevoluteJoint', {
        lowerAngle: Number.NaN,
        upperAngle: Number.NaN,
        enableLimit: false,
        maxMotorTorque: 10.0,
        motorSpeed: 0.0,
        enableMotor: false,
        bodyAName: null,
        bodyBName: null
    });

    m.$c('ngSensor', {});

    m.$c('ngSensorAny', {
    });

    m.$c('ngSensorAnyDetectOneEntity', {
    });
})(darlingjs);