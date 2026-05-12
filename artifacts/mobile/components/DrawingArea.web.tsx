import React, { useEffect, useRef } from "react";

export interface Point    { x: number; y: number }
export interface DrawPath { points: Point[]; color: string; width: number; isEraser: boolean }
export type Tool = "pencil" | "brush" | "eraser";

export interface DrawingAreaProps {
  paths: DrawPath[];
  activeTool: Tool;
  selectedColor: string;
  onStrokeComplete: (stroke: DrawPath) => void;
}

function toolWidth(tool: Tool)            { return tool === "brush" ? 10 : tool === "eraser" ? 28 : 4; }
function toolColor(tool: Tool, c: string) { return tool === "eraser" ? "#FFFFFF" : c; }

function drawPathOnCtx(ctx: CanvasRenderingContext2D, path: DrawPath) {
  if (path.points.length === 0) return;
  ctx.beginPath();
  ctx.strokeStyle = path.color;
  ctx.fillStyle   = path.color;
  ctx.lineWidth   = path.width;
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";
  if (path.points.length === 1) {
    ctx.arc(path.points[0].x, path.points[0].y, path.width / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.moveTo(path.points[0].x, path.points[0].y);
  for (let i = 1; i < path.points.length; i++) {
    ctx.lineTo(path.points[i].x, path.points[i].y);
  }
  ctx.stroke();
}

function redrawAll(canvas: HTMLCanvasElement, paths: DrawPath[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const p of paths) drawPathOnCtx(ctx, p);
}

export function DrawingArea({ paths, activeTool, selectedColor, onStrokeComplete }: DrawingAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const isDrawing    = useRef(false);
  const currentPts   = useRef<Point[]>([]);
  const toolRef      = useRef<Tool>(activeTool);
  const colorRef     = useRef(selectedColor);
  const pathsRef     = useRef<DrawPath[]>(paths);

  useEffect(() => { toolRef.current  = activeTool;    }, [activeTool]);
  useEffect(() => { colorRef.current = selectedColor; }, [selectedColor]);
  useEffect(() => { pathsRef.current = paths;         }, [paths]);

  // Resize canvas to match its CSS container, then redraw
  useEffect(() => {
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    if (!container || !canvas) return;

    function resize() {
      const { width, height } = container!.getBoundingClientRect();
      if (width > 0 && height > 0) {
        canvas!.width  = width;
        canvas!.height = height;
        redrawAll(canvas!, pathsRef.current);
      }
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Redraw all committed paths whenever they change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    redrawAll(canvas, paths);
  }, [paths]);

  function getPos(e: React.PointerEvent<HTMLCanvasElement>): Point {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    isDrawing.current  = true;
    const pt           = getPos(e);
    currentPts.current = [pt];

    // Draw starting dot immediately so single taps are visible
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      const tool  = toolRef.current;
      const color = colorRef.current;
      ctx.beginPath();
      ctx.fillStyle = toolColor(tool, color);
      ctx.arc(pt.x, pt.y, toolWidth(tool) / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing.current) return;
    const pt   = getPos(e);
    const prev = currentPts.current[currentPts.current.length - 1];
    currentPts.current.push(pt);

    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && prev) {
      const tool  = toolRef.current;
      const color = colorRef.current;
      ctx.beginPath();
      ctx.strokeStyle = toolColor(tool, color);
      ctx.lineWidth   = toolWidth(tool);
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    }
  }

  function handlePointerUp() {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (currentPts.current.length > 0) {
      const tool  = toolRef.current;
      const color = colorRef.current;
      onStrokeComplete({
        points:   [...currentPts.current],
        color:    toolColor(tool, color),
        width:    toolWidth(tool),
        isEraser: tool === "eraser",
      });
      currentPts.current = [];
    }
  }

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          display:     "block",
          width:       "100%",
          height:      "100%",
          touchAction: "none",
          cursor:      activeTool === "eraser" ? "cell" : "crosshair",
        }}
      />
    </div>
  );
}
