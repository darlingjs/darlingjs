/**
 * Project: darlingjs (GameEngine).
 * Copyright (c) 2013, Eugene-Krevenets
 */
describe('darlingutil', function() {
    'use strict';

    describe('convex polygon clockwise detect', function() {
        it('should ignore empty polygon', function() {
            var emptyPolygon = [];
            expect(darlingutil.isConvexPolygonClockwise(emptyPolygon)).toBeUndefined();
        });

        it('should ignore null polygon', function() {
            expect(darlingutil.isConvexPolygonClockwise(null)).toBeUndefined();
        });

        it('should ignore straight line polygon', function() {
            var emptyPolygon = [{
                x: 0, y: 0
            },{
                x: 1, y: 0
            },{
                x: 2, y: 0
            }];
            expect(darlingutil.isConvexPolygonClockwise(emptyPolygon)).toBeUndefined();
        });

        it('should detect square {0,0}-{1,0}-{1,1}-{0,1} as anticlockwise', function() {
            var emptyPolygon = [{
                x: 0, y: 0
            },{
                x: 1, y: 0
            },{
                x: 1, y: 1
            },{
                x: 0, y: 1
            }];
            expect(darlingutil.isConvexPolygonClockwise(emptyPolygon)).toBeFalsy();
        });

        it('should detect square {1,0}-{1,1}-{0,1}-{0,0} as anticlockwise', function() {
            var emptyPolygon = [{
                x: 1, y: 0
            },{
                x: 1, y: 1
            },{
                x: 0, y: 1
            },{
                x: 0, y: 0
            }];
            expect(darlingutil.isConvexPolygonClockwise(emptyPolygon)).toBeFalsy();
        });

        it('should detect square {1,1}-{0,1}-{0,0}-{1,0} as anticlockwise', function() {
            var emptyPolygon = [{
                x: 1, y: 1
            },{
                x: 0, y: 1
            },{
                x: 0, y: 0
            },{
                x: 1, y: 0
            }];
            expect(darlingutil.isConvexPolygonClockwise(emptyPolygon)).toBeFalsy();
        });

        it('should detect square {0,1}-{0,0}-{1,0}-{1,1} as anticlockwise', function() {
            var emptyPolygon = [{
                x: 0, y: 1
            },{
                x: 0, y: 0
            },{
                x: 1, y: 0
            },{
                x: 1, y: 1
            }];
            expect(darlingutil.isConvexPolygonClockwise(emptyPolygon)).toBeFalsy();
        });

        it('should detect square {0,0}-{0,1}-{1,1}-{1,0} as clockwise', function() {
            var emptyPolygon = [{
                x: 0, y: 0
            },{
                x: 0, y: 1
            },{
                x: 1, y: 1
            },{
                x: 1, y: 0
            }];
            expect(darlingutil.isConvexPolygonClockwise(emptyPolygon)).toBeTruthy();
        });

        it('should detect square {0,1}-{1,1}-{1,0}-{0,0} as clockwise', function() {
            var emptyPolygon = [{
                x: 0, y: 1
            },{
                x: 1, y: 1
            },{
                x: 1, y: 0
            },{
                x: 0, y: 0
            }];
            expect(darlingutil.isConvexPolygonClockwise(emptyPolygon)).toBeTruthy();
        });

        it('should detect square {1,1}-{1,0}-{0,0}-{0,1} as clockwise', function() {
            var emptyPolygon = [{
                x: 1, y: 1
            },{
                x: 1, y: 0
            },{
                x: 0, y: 0
            },{
                x: 0, y: 1
            }];
            expect(darlingutil.isConvexPolygonClockwise(emptyPolygon)).toBeTruthy();
        });

        it('should detect square {1,0}-{0,0}-{0,1}-{1,1} as clockwise', function() {
            var emptyPolygon = [{
                x: 1, y: 0
            },{
                x: 0, y: 0
            },{
                x: 0, y: 1
            },{
                x: 1, y: 1
            }];
            expect(darlingutil.isConvexPolygonClockwise(emptyPolygon)).toBeTruthy();
        });

        it('should detect square {1,0}-{0,1}-{-1,0}-{0,-1} as clockwise', function() {
            var emptyPolygon = [{
                x: 1, y: 0
            },{
                x: 0, y: -1
            },{
                x: -1, y: 0
            },{
                x: 0, y: 1
            }];
            expect(darlingutil.isConvexPolygonClockwise(emptyPolygon)).toBeTruthy();
        });
    });
});