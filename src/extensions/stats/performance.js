/**
 * Project: darlingjs / GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

(function(darlingjs) {
    'use strict';

    var m = darlingjs.m('ngPerformance');

    m.$s('ngPerformanceStartLog', {
        $beforeUpdate: function() {
            this.startTime = Date.now();
        }
    });

    m.$s('ngPerformanceStopLog', {
        enabled: true,

        logToConsole: true,
        logToGoogleAnalytics: true,

        _warmUpInterval: 4 * 1000,

        _sampleInterval: 400,

        _sampleIndex: 0,
        _samplesForPerformance: [],
        _samplesForFPS: [],

        $afterUpdate: ['ngPerformanceStartLog', '$time', function(ngPerformanceStartLog, $time) {
            if (!this.enabled) {
                return;
            }

            this._warmUpInterval -= $time;
            if (this._warmUpInterval >= 0) {
                this.previous = Date.now();
                return;
            }

            var current = Date.now(),
                delta = current - ngPerformanceStartLog.startTime;

            this._samplesForPerformance[this._sampleIndex] = delta;

            delta = current - this.previous;
            this._samplesForFPS[this._sampleIndex] = delta;
            this.previous = current;

            if(++this._sampleIndex >= this._sampleInterval) {
                var avgPerformance = getAvg(this._samplesForPerformance),
                    stdPerformance = getStd(this._samplesForPerformance, avgPerformance);


                var avgFps = 1000 / getAvg(this._samplesForFPS),
                    stdFps = 1000 / getStd(this._samplesForFPS, avgFps);

                if (this.logToConsole) {
                    console.log('performance avg : ' + avgPerformance + ' stdsqr : ' + Math.sqrt(stdPerformance));
                    console.log('fps avg : ' + avgFps + ' stdsqr : ' + Math.sqrt(stdFps));
                }

                if (this.logToGoogleAnalytics && window._gaq) {
                    _gaq.push(['_trackEvent', 'performance-avg', 'performance-avg', avgPerformance]);

                    var performanceType;
                    if (avgFps < 40) {
                        performanceType = 'low-fps';
                    } else {
                        performanceType = 'high-fps';
                    }

                    _gaq.push(['_trackEvent', 'fps-avg', performanceType, avgFps]);
                }

                this._sampleIndex = 0;
            }
        }]
    });

    function getAvg(array) {
        var i,
            count,
            avg = 0;
        for(i = 0, count = array.length; i < count; i++) {
            avg += array[i];
        }

        return avg/count;
    }

    function getStd(array, avg) {
        var stdsqr = 0;

        for(var i = 0, count = array.length; i < count; i++) {
            var value = avg - array[i];
            stdsqr += value*value;
        }

        return Math.sqrt(stdsqr/(count-1));
    }
}) (darlingjs);