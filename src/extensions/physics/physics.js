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

    m.$c('ngAnyJoint', {
        joint: null
    });

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
        //TODO:
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

    m.$c('ngMotorSwitcher', {
        targetId: null,
        targetEntity: null
    });

    m.$c('ngEnableMotor', {});

    m.$c('ngEnableMotorReverse', {});

    m.$c('ngEnableMotorOnKeyDown', {
        //array of key codes for enabling motor
        keyCode: null,
        //array of key codes for enabling reverse motor
        keyCodeReverse: null
    });

    m.$c('ngMotorWithAcceleration', {
        min: 0.0,
        max: 10.0,
        acceleration: 0.1,
        degradation: 0.1
    });

    /**
     * Just Enable Motor (add component ngEnableMotor/ngEnableMotorReverse) on key down, and stop motor on up.
     *
     */
    m.$s('ngEnableMotorOnKeyDown', {
        $require: ['ngEnableMotorOnKeyDown', 'ngSelected'],

        $addNode: function($node) {
            var keyCode = $node.ngEnableMotorOnKeyDown.keyCode;
            var keyCodeReverse = $node.ngEnableMotorOnKeyDown.keyCodeReverse;

            this._target = document.getElementById(this.domId) || document;
            this._target.addEventListener('keydown', function(e) {
                var index;
                index = keyCode.indexOf(e.keyCode);
                if (index >= 0) {
                    if (!$node.$has('ngEnableMotor')) {
                        $node.$add('ngEnableMotor');
                    }
                } else {
                    index = keyCodeReverse.indexOf(e.keyCode);
                    if (index >= 0) {
                        if (!$node.$has('ngEnableMotor')) {
                            $node.$add('ngEnableMotor');
                        }
                        if (!$node.$has('ngEnableMotorReverse')) {
                            $node.$add('ngEnableMotorReverse');
                        }
                    }
                }
            });
            this._target.addEventListener('keyup', function(e) {
                var index = keyCode.indexOf(e.keyCode);
                if (index >= 0) {
                    $node.$remove('ngEnableMotor');
                } else {
                    index = keyCodeReverse.indexOf(e.keyCode);
                    if (index >= 0) {
                        $node.$remove('ngEnableMotor');
                        $node.$remove('ngEnableMotorReverse');
                    }
                }
            });
        }
    });

    m.$c('ngWantsToCollide', {
        'with' : [
            {
                'andGet': 'ngCollide'
            },
            {
                'any': ['ngBonus'],
                'andGet': 'ngGetBonus'
            },
            {
                'any': ['ngSounding'],
                'andGet': 'ngPlaySoundOf'
            }
        ]
    });

    m.$c('ngCollide');

    m.$c('ngCollisionGroup', {
        'alwaysWith': null,
        'neverWith': null
    });

    m.$c('ngCollisionCategory', {
        'is': ['rock'],
        'collideWith': ['vehicle']
    });
})(darlingjs);