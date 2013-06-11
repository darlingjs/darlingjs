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
        angularDamping: 0.0,
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

    m.$c('ngEnableMotorOnAccelerometer', {
        xAxis: false,
        yAxis: false,
        zAxis: false,
        edge: 15.0,
        invert: true
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

        $addEntity: function($entity) {
            var component = $entity.ngEnableMotorOnKeyDown;

            var keyCode = component.keyCode;
            var keyCodeReverse = component.keyCodeReverse;

            this._target = document.getElementById(this.domId) || document;

            function onKeyDown(e) {
                var index;
                index = keyCode.indexOf(e.keyCode);
                if (index >= 0) {
                    if (!$entity.$has('ngEnableMotor')) {
                        $entity.$add('ngEnableMotor');
                    }
                } else {
                    index = keyCodeReverse.indexOf(e.keyCode);
                    if (index >= 0) {
                        if (!$entity.$has('ngEnableMotorReverse')) {
                            $entity.$add('ngEnableMotorReverse');
                        }
                        if (!$entity.$has('ngEnableMotor')) {
                            $entity.$add('ngEnableMotor');
                        }
                    }
                }
            }

            function onKeyUp(e) {
                var index = keyCode.indexOf(e.keyCode);
                if (index >= 0) {
                    $entity.$remove('ngEnableMotor');
                } else {
                    index = keyCodeReverse.indexOf(e.keyCode);
                    if (index >= 0) {
                        $entity.$remove('ngEnableMotorReverse');
                        $entity.$remove('ngEnableMotor');
                    }
                }
            }
            component.$$onKeyDown = onKeyDown;
            component.$$onKeyUp = onKeyUp;

            this._target.addEventListener('keydown', onKeyDown);
            this._target.addEventListener('keyup', onKeyUp);
        },

        $removeEntity: function($entity) {
            var component = $entity.ngEnableMotorOnKeyDown;
            this._target.removeEventListener('keydown', component.$$onKeyDown);
            this._target.removeEventListener('keyup', component.$$onKeyUp);
        }
    });

    m.$s('ngEnableMotorOnAccelerometer', {
        $require: ['ngEnableMotorOnAccelerometer', 'ngSelected'],

        _calibration: {alpha:0.0, beta:0.0, gamma:0.0},
        _acceleration: {x:0.0, y:0.0, z:0.0},
        _handler: null,
        _enabled: false,

        $added: function() {
            var self = this;
            window.addEventListener('deviceorientation', this._handler = function(e) {
                self._acceleration.x = e.alpha - self._calibration.alpha;
                self._acceleration.y = e.beta - self._calibration.beta;
                self._acceleration.z = e.gamma - self._calibration.gamma;
            });
        },

        $remove: function() {
            window.removeEventListener('deviceorientation', this._handler);
        },

        enableMotorIsInInterval: function($entity, value, edge, invert) {
            var enablingMotor = false;
            var reverse = false;
            if (value > edge) {
                enablingMotor = true;
                reverse = false;
            } else if (value < -edge) {
                enablingMotor = true;
                reverse = true;
            }

            if (invert) {
                reverse = !reverse;
            }

            if (enablingMotor) {
                this._enabled = true;
                if (!$entity.ngEnableMotor) {
                    $entity.$add('ngEnableMotor');
                }
                if (reverse) {
                    if (!$entity.ngEnableMotorReverse) {
                        $entity.$add('ngEnableMotorReverse');
                    }
                } else {
                    if ($entity.ngEnableMotorReverse) {
                        $entity.$remove('ngEnableMotorReverse');
                    }
                }
            } else {
                if (this._enabled) {
                    this._enabled = false;
                    if ($entity.ngEnableMotorReverse) {
                        $entity.$remove('ngEnableMotorReverse');
                    }
                    if ($entity.ngEnableMotor) {
                        $entity.$remove('ngEnableMotor');
                    }
                }
            }
        },

        $update: ['$entity', function($entity) {
            var component = $entity.ngEnableMotorOnAccelerometer;
            if (component.xAxis) {
                this.enableMotorIsInInterval($entity, this._acceleration.x, $entity.ngEnableMotorOnAccelerometer.edge, component.invert);
            } else if (component.yAxis) {
                this.enableMotorIsInInterval($entity, this._acceleration.y, $entity.ngEnableMotorOnAccelerometer.edge, component.invert);
            } else if (component.zAxis) {
                this.enableMotorIsInInterval($entity, this._acceleration.z, $entity.ngEnableMotorOnAccelerometer.edge, component.invert);
            }
        }]
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