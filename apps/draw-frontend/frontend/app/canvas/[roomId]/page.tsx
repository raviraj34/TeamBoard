'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from "fabric";
import { debounce } from 'lodash';
import { MessageSquare, X, Send, Users } from 'lucide-react';
import {useSocket} from "../../hooks/useSocket"

interface ChatMessage {
  message: string;
  userId?: string;
  timestamp?: Date;
}

export default function CanvasEditor({ params }: { params: { roomId: string } }) {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [selectedTool, setSelectedTool] = useState('select');
  const [fillColor, setFillColor] = useState('#3b82f6');
  const [strokeColor, setStrokeColor] = useState('#1e3a8a');
  const isRemoteUpdate = useRef(false);
  
  // Chat states
  const [showChat, setShowChat] = useState(false);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [currentMsg, setCurrentMsg] = useState("");
  const [userCount, setUserCount] = useState(1);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // WebSocket
  const { socket, loading } = useSocket();

  // Load initial chat messages
  useEffect(() => {
    const loadInitialChats = async () => {
      try {
        const response = await fetch(`/api/chats/${params.roomId}`);
        const data = await response.json();
        if (data.messages) {
          setChats(data.messages);
        }
      } catch (error) {
        console.error('Failed to load chat messages:', error);
      }
    };

    loadInitialChats();
  }, [params.roomId]);

  // WebSocket message handling
  useEffect(() => {
    if (socket && !loading) {
      // Join room
      socket.send(JSON.stringify({
        type: "join_room",
        roomId: params.roomId
      }));

      socket.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          
          // Handle chat messages
          if (parsedData.type === "chat") {
            setChats(c => [...c, { 
              message: parsedData.message,
              userId: parsedData.userId,
              timestamp: new Date()
            }]);
          }

          // Handle room events
          if (parsedData.type === "joined_room") {
            setUserCount(parsedData.userCount);
            loadCanvas();
          }

          if (parsedData.type === "user_joined") {
            setUserCount(prev => prev + 1);
          }

          if (parsedData.type === "user_left") {
            setUserCount(prev => Math.max(1, prev - 1));
          }

          // Handle canvas events
          handleCanvasMessage(parsedData);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };
    }
  }, [socket, loading, params.roomId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  // Handle canvas WebSocket messages
  function handleCanvasMessage(message: any) {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    isRemoteUpdate.current = true;

    switch (message.type) {
      case 'object-added':
        fabric.util.enlivenObjects([message.payload.object], (objects: any) => {
          objects.forEach((obj: any) => {
            canvas.add(obj);
          });
          canvas.renderAll();
        });
        break;

      case 'object-modified':
        const modifiedObj = canvas.getObjects().find((obj: any) => 
          obj.id === message.payload.object.id
        );
        if (modifiedObj) {
          modifiedObj.set(message.payload.object);
          modifiedObj.setCoords();
          canvas.renderAll();
        }
        break;

      case 'object-removed':
        const removedObj = canvas.getObjects().find((obj: any) => 
          obj.id === message.payload.objectId
        );
        if (removedObj) {
          canvas.remove(removedObj);
          canvas.renderAll();
        }
        break;

      case 'path-created':
        fabric.util.enlivenObjects([message.payload.path], (objects: any) => {
          objects.forEach((obj: any) => {
            canvas.add(obj);
          });
          canvas.renderAll();
        });
        break;

      case 'canvas-cleared':
        canvas.clear();
        canvas.backgroundColor = '#ffffff';
        canvas.renderAll();
        break;
    }

    isRemoteUpdate.current = false;
  }

  // Send WebSocket message
  const sendWSMessage = (type: string, payload: any) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, payload }));
    }
  };

  // Send chat message
  const sendChatMessage = () => {
    if (!currentMsg.trim() || !socket) return;

    socket.send(JSON.stringify({
      type: "chat",
      roomId: params.roomId,
      message: currentMsg
    }));

    setCurrentMsg("");
  };

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth - (showChat ? 420 : 100),
      height: window.innerHeight - 150,
      backgroundColor: '#ffffff',
    });

    fabricCanvasRef.current = canvas;

    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth - (showChat ? 420 : 100),
        height: window.innerHeight - 150
      });
      canvas.renderAll();
    };

    window.addEventListener('resize', handleResize);
    setupCanvasListeners(canvas);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, [showChat]);

  // Resize canvas when chat opens/closes
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setDimensions({
        width: window.innerWidth - (showChat ? 420 : 100),
        height: window.innerHeight - 150
      });
      fabricCanvasRef.current.renderAll();
    }
  }, [showChat]);

  // Setup Canvas event listeners
  function setupCanvasListeners(canvas: fabric.Canvas) {
    canvas.on('object:added', (e: any) => {
      if (isRemoteUpdate.current) return;

      const obj = e.target;
      obj.id = obj.id || `obj_${Date.now()}_${Math.random()}`;

      sendWSMessage('object-added', {
        roomId: params.roomId,
        object: obj.toJSON(['id'])
      });

      saveToDatabase();
    });

    canvas.on('object:modified', (e: any) => {
      if (isRemoteUpdate.current) return;

      const obj = e.target;

      sendWSMessage('object-modified', {
        roomId: params.roomId,
        object: obj.toJSON(['id'])
      });

      saveToDatabase();
    });

    canvas.on('object:removed', (e: any) => {
      if (isRemoteUpdate.current) return;

      const obj = e.target;

      sendWSMessage('object-removed', {
        roomId: params.roomId,
        objectId: obj.id
      });

      saveToDatabase();
    });

    canvas.on('path:created', (e: any) => {
      if (isRemoteUpdate.current) return;

      const path = e.path;
      path.id = `path_${Date.now()}_${Math.random()}`;

      sendWSMessage('path-created', {
        roomId: params.roomId,
        path: path.toJSON(['id'])
      });

      saveToDatabase();
    });
  }

  // Load canvas from database
  const loadCanvas = async () => {
    try {
      const res = await fetch(`/api/canvas/${params.roomId}`);
      const { canvasData } = await res.json();

      if (canvasData && fabricCanvasRef.current) {
        isRemoteUpdate.current = true;
        fabricCanvasRef.current.loadFromJSON(canvasData, () => {
          fabricCanvasRef.current?.renderAll();
          isRemoteUpdate.current = false;
        });
      }
    } catch (error) {
      console.error('Failed to load canvas:', error);
    }
  };

  // Save to database (debounced)
  const saveToDatabase = debounce(async () => {
    if (!fabricCanvasRef.current) return;

    try {
      const canvasData = fabricCanvasRef.current.toJSON(['id']);
      await fetch(`/api/canvas/${params.roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvasData })
      });
    } catch (error) {
      console.error('Failed to save canvas:', error);
    }
  }, 1000);

  // Tool functions
  const addRectangle = () => {
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 150,
      height: 100,
      fill: 'transparent',
      stroke: strokeColor,
      strokeWidth: 2,
    });
    fabricCanvasRef.current?.add(rect);
    fabricCanvasRef.current?.setActiveObject(rect);
    fabricCanvasRef.current?.renderAll();
  };

  const addCircle = () => {
    const circle = new fabric.Circle({
      left: 150,
      top: 150,
      radius: 50,
      fill: 'transparent',
      stroke: strokeColor,
      strokeWidth: 2,
    });
    fabricCanvasRef.current?.add(circle);
    fabricCanvasRef.current?.setActiveObject(circle);
    fabricCanvasRef.current?.renderAll();
  };

  const addTriangle = () => {
    const triangle = new fabric.Triangle({
      left: 200,
      top: 200,
      width: 100,
      height: 100,
      fill: 'transparent',
      stroke: strokeColor,
      strokeWidth: 2,
    });
    fabricCanvasRef.current?.add(triangle);
    fabricCanvasRef.current?.setActiveObject(triangle);
    fabricCanvasRef.current?.renderAll();
  };

  const addLine = () => {
    const line = new fabric.Line([50, 50, 200, 50], {
      stroke: strokeColor,
      strokeWidth: 3,
    });
    fabricCanvasRef.current?.add(line);
    fabricCanvasRef.current?.setActiveObject(line);
    fabricCanvasRef.current?.renderAll();
  };

  const addText = () => {
    const text = new fabric.IText('Double-click to edit', {
      left: 100,
      top: 100,
      fontSize: 20,
      fill: 'black',
      fontFamily: 'Arial',
    });
    fabricCanvasRef.current?.add(text);
    fabricCanvasRef.current?.setActiveObject(text);
    fabricCanvasRef.current?.renderAll();
  };

  const enableDrawing = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = strokeColor;
    canvas.freeDrawingBrush.width = 3;
    canvas.isDrawingMode = true;
    setSelectedTool('draw');
  };

  const disableDrawing = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = false;
    }
    setSelectedTool('select');
  };

  const deleteSelected = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
      canvas.remove(...activeObjects);
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  };

  const clearCanvas = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    isRemoteUpdate.current = true;
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    canvas.renderAll();
    isRemoteUpdate.current = false;

    sendWSMessage('canvas-cleared', {
      roomId: params.roomId
    });

    saveToDatabase();
  };

  const changeColor = (color: string, type: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

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
      if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = color;
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Connection Status */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
          !loading ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            !loading ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`}></div>
          <span className="text-sm font-medium">
            {!loading ? 'Connected' : 'Connecting...'}
          </span>
        </div>

        {!loading && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg bg-indigo-100 text-indigo-700">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">
              {userCount} online
            </span>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white shadow-md p-4 flex flex-wrap gap-2 items-center border-b justify-between">
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
          
          {/* Chat Toggle */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              showChat
                ? 'bg-indigo-500 text-white'
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            Chat
            {chats.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {chats.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Canvas and Chat Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <div className="bg-white shadow-lg">
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-white border-l shadow-lg flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Room Chat</h3>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">No messages yet</p>
                  <p className="text-gray-400 text-xs">Start the conversation!</p>
                </div>
              ) : (
                chats.map((msg, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-indigo-600">
                        {msg.userId ? `User ${msg.userId.slice(0, 8)}...` : 'Anonymous'}
                      </span>
                      {msg.timestamp && (
                        <span className="text-xs text-gray-400">
                          {new Date(msg.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-900">{msg.message}</div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentMsg}
                  onChange={(e) => setCurrentMsg(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={loading}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={loading || !currentMsg.trim()}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
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