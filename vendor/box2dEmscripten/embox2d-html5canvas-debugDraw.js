(function(window){
    'use strict';
    var api = window.customDebugDraw = window.customDebugDraw||{};

    api.drawAxes = drawAxes;

    function drawAxes(ctx) {
        ctx.strokeStyle = 'rgb(192,0,0)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(1, 0);
        ctx.stroke();
        ctx.strokeStyle = 'rgb(0,192,0)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 1);
        ctx.stroke();
    }

    function setColorFromDebugDrawCallback(context, color) {
        var col = Box2D.wrapPointer(color, Box2D.b2Color);
        var red = (col.get_r() * 255)|0;
        var green = (col.get_g() * 255)|0;
        var blue = (col.get_b() * 255)|0;
        var colStr = red+","+green+","+blue;
        context.fillStyle = "rgba("+colStr+",0.5)";
        context.strokeStyle = "rgb("+colStr+")";
    }

    function drawSegment(context, vert1, vert2) {
        var vert1V = Box2D.wrapPointer(vert1, Box2D.b2Vec2);
        var vert2V = Box2D.wrapPointer(vert2, Box2D.b2Vec2);
        context.beginPath();
        context.moveTo(vert1V.get_x(), vert1V.get_y());
        context.lineTo(vert2V.get_x(), vert2V.get_y());
        context.stroke();
    }

    function drawPolygon(context, vertices, vertexCount, fill) {
        context.beginPath();
        context.lineWidth = 0;
        for(var tmpI=0;tmpI<vertexCount;tmpI++) {
            var vert = Box2D.wrapPointer(vertices+(tmpI*8), Box2D.b2Vec2);
            if ( tmpI === 0 )
                context.moveTo(vert.get_x(), vert.get_y());
            else
                context.lineTo(vert.get_x(), vert.get_y());
        }
        context.closePath();
        if (fill)
            context.fill();
        context.stroke();
    }

    function drawCircle(context, center, radius, axis, fill) {
        var centerV = Box2D.wrapPointer(center, Box2D.b2Vec2);
        var axisV = Box2D.wrapPointer(axis, Box2D.b2Vec2);

        context.beginPath();
        context.arc(centerV.get_x(), centerV.get_y(), radius, 0, 2 * Math.PI, false);
        if (fill)
            context.fill();
        context.stroke();

        if (fill) {
            //render axis marker
            var vert2V = copyVec2(centerV);
            vert2V.op_add( scaledVec2(axisV, radius) );
            context.beginPath();
            context.moveTo(centerV.get_x(), centerV.get_y());
            context.lineTo(vert2V.get_x(), vert2V.get_y());
            context.stroke();
        }
    }

    function drawTransform(context, transform) {
        var trans = Box2D.wrapPointer(transform,Box2D.b2Transform);
        var pos = trans.get_p();
        var rot = trans.get_q();

        context.save();
        context.translate(pos.get_x(), pos.get_y());
        context.scale(0.5,0.5);
        context.rotate(rot.GetAngle());
        context.lineWidth *= 2;
        drawAxes(context);
        context.restore();
    }

    api.getCanvasDebugDraw = getCanvasDebugDraw;

    function getCanvasDebugDraw(context) {
        var debugDraw = new Box2D.b2Draw();

        Box2D.customizeVTable(debugDraw, [{
        original: Box2D.b2Draw.prototype.DrawSegment,
        replacement:
            function(ths, vert1, vert2, color) {
                setColorFromDebugDrawCallback(context, color);
                drawSegment(context, vert1, vert2);
            }
        }]);

        Box2D.customizeVTable(debugDraw, [{
        original: Box2D.b2Draw.prototype.DrawPolygon,
        replacement:
            function(ths, vertices, vertexCount, color) {
                setColorFromDebugDrawCallback(context, color);
                drawPolygon(context, vertices, vertexCount, false);
            }
        }]);

        Box2D.customizeVTable(debugDraw, [{
        original: Box2D.b2Draw.prototype.DrawSolidPolygon,
        replacement:
            function(ths, vertices, vertexCount, color) {
                setColorFromDebugDrawCallback(context, color);
                drawPolygon(context, vertices, vertexCount, true);
            }
        }]);

        Box2D.customizeVTable(debugDraw, [{
        original: Box2D.b2Draw.prototype.DrawCircle,
        replacement:
            function(ths, center, radius, color) {
                setColorFromDebugDrawCallback(context, color);
                var dummyAxis = Box2D.b2Vec2(0,0);
                drawCircle(context, center, radius, dummyAxis, false);
            }
        }]);

        Box2D.customizeVTable(debugDraw, [{
        original: Box2D.b2Draw.prototype.DrawSolidCircle,
        replacement:
            function(ths, center, radius, axis, color) {
                setColorFromDebugDrawCallback(context, color);
                drawCircle(context, center, radius, axis, true);
            }
        }]);

        Box2D.customizeVTable(debugDraw, [{
        original: Box2D.b2Draw.prototype.DrawTransform,
        replacement:
            function(ths, transform) {
                drawTransform(context, transform);
            }
        }]);

        return debugDraw;
    }

})(window);