'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from "fabric"

export default function CanvasEditor() {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [selectedTool, setSelectedTool] = useState('select');
  const [fillColor, setFillColor] = useState('#3b82f6');
  const [strokeColor, setStrokeColor] = useState('#1e3a8a');

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth - 100,
      height: window.innerHeight - 150,
      backgroundColor: '#ffffff',
    });

    fabricCanvasRef.current = canvas;

    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth - 100,
        height: window.innerHeight - 150,
      });
      canvas.renderAll();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, []);

  const addRectangle = () => {
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 150,
      height: 100,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth: 2,
    });
    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.setActiveObject(rect);
    fabricCanvasRef.current.renderAll();
  };

  const addCircle = () => {
    const circle = new fabric.Circle({
      left: 150,
      top: 150,
      radius: 50,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth: 2,
    });
    fabricCanvasRef.current.add(circle);
    fabricCanvasRef.current.setActiveObject(circle);
    fabricCanvasRef.current.renderAll();
  };

  const addTriangle = () => {
    const triangle = new fabric.Triangle({
      left: 200,
      top: 200,
      width: 100,
      height: 100,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth: 2,
    });
    fabricCanvasRef.current.add(triangle);
    fabricCanvasRef.current.setActiveObject(triangle);
    fabricCanvasRef.current.renderAll();
  };

  const addLine = () => {
    const line = new fabric.Line([50, 50, 200, 50], {
      stroke: strokeColor,
      strokeWidth: 3,
    });
    fabricCanvasRef.current.add(line);
    fabricCanvasRef.current.setActiveObject(line);
    fabricCanvasRef.current.renderAll();
  };

  const addText = () => {
    const text = new fabric.IText('Double-click to edit', {
      left: 100,
      top: 100,
      fontSize: 20,
      fill: strokeColor,
      fontFamily: 'Arial',
    });
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
  };

  const enableDrawing = () => {
    const canvas = fabricCanvasRef.current;
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.color = strokeColor;
    canvas.freeDrawingBrush.width = 3;
    setSelectedTool('draw');
  };

  const disableDrawing = () => {
    fabricCanvasRef.current.isDrawingMode = false;
    setSelectedTool('select');
  };

  const deleteSelected = () => {
    const canvas = fabricCanvasRef.current;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
      canvas.remove(...activeObjects);
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  };

  const clearCanvas = () => {
    fabricCanvasRef.current.clear();
    fabricCanvasRef.current.backgroundColor = '#ffffff';
    fabricCanvasRef.current.renderAll();
  };

  const changeColor = (color, type) => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();
    
    if (type === 'fill') {
      setFillColor(color);
      if (activeObject && activeObject.type !== 'line') {
        activeObject.set('fill', color);
        canvas.renderAll();
      }
    } else {
      setStrokeColor(color);
      if (activeObject) {
        if (activeObject.type === 'i-text') {
          activeObject.set('fill', color);
        } else {
          activeObject.set('stroke', color);
        }
        canvas.renderAll();
      }
      if (canvas.isDrawingMode) {
        canvas.freeDrawingBrush.color = color;
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white shadow-md p-4 flex flex-wrap gap-2 items-center border-b">
        <div className="flex gap-2">
          <button
            onClick={disableDrawing}
            className={`px-4 py-2 rounded ${
              selectedTool === 'select'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Select
          </button>
          <button
            onClick={addRectangle}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Rectangle
          </button>
          <button
            onClick={addCircle}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Circle
          </button>
          <button
            onClick={addTriangle}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Triangle
          </button>
          <button
            onClick={addLine}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Line
          </button>
          <button
            onClick={addText}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Text
          </button>
          <button
            onClick={enableDrawing}
            className={`px-4 py-2 rounded ${
              selectedTool === 'draw'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Draw
          </button>
        </div>

        <div className="flex gap-2 items-center border-l pl-4 ml-4">
          <label className="flex items-center gap-2">
            <span className="text-sm">Fill:</span>
            <input
              type="color"
              value={fillColor}
              onChange={(e) => changeColor(e.target.value, 'fill')}
              className="w-10 h-10 rounded cursor-pointer"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-sm">Stroke:</span>
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => changeColor(e.target.value, 'stroke')}
              className="w-10 h-10 rounded cursor-pointer"
            />
          </label>
        </div>

        <div className="flex gap-2 border-l pl-4 ml-4">
          <button
            onClick={deleteSelected}
            className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded"
          >
            Delete
          </button>
          <button
            onClick={clearCanvas}
            className="px-4 py-2 bg-gray-700 text-white hover:bg-gray-800 rounded"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div className="bg-white shadow-lg">
          <canvas ref={canvasRef} />
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-800 text-white p-3 text-sm">
        <p>
          <strong>Tips:</strong> Click shapes to select • Drag to move • Use
          corners to resize • Double-click text to edit • Hold Shift while
          dragging for proportional scaling
        </p>
      </div>
    </div>
  );
}