'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Plus, LogIn, Users, Sparkles, ArrowRight, Hash, AlertCircle } from 'lucide-react';
import { HTTP_URL } from '../config';
import { log } from 'node:console';

export default function RoomLandingPage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    setIsCreating(true);
    setError('');
    
    try {
      // Generate random room ID
      const newRoomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const token = localStorage.getItem("Authorization");
      // Create room in database
      const response = await fetch(`${HTTP_URL}/room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
           "Authorization": token ? token : ""
        },
        body: JSON.stringify({
          slug:newRoomId
        })
      });

      const data = await response.json();
      const realroomId= data.roomId;

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create room');
      }

      // Redirect to canvas
      router.push(`/canvas/${realroomId}`);
    } catch (err: any) {
      console.error('Error creating room:', err);
      setError(err.message || 'Failed to create room. Please try again.');
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }

    setIsJoining(true);
    setError('');
    
    try {
      // Validate room exists
      const response = await fetch(`${HTTP_URL}/room`);
      const data = await response.json();
      const actualroomID = data.roomId;
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Room not found. Please check the room ID.');
        }
        throw new Error(data.error || 'Failed to join room');
      }
      const joinroomId = setRoomId(roomId)
      console.log(joinroomId);
      
      // Redirect to canvas
      router.push(`/canvas/${actualroomID}`);
    } catch (err: any) {
      console.error('Error joining room:', err);
      setError(err.message || 'Failed to join room. Please try again.');
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
              <Pencil className="w-9 h-9 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              DrawFlow
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Collaborate in real-time with your team on an infinite canvas. Draw, brainstorm, and create together.
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {['Real-time Collaboration', 'Unlimited Canvas', 'Team Chat'].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-900 font-semibold text-sm">Error</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Main Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Create Room Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200 relative overflow-hidden group hover:shadow-3xl transition-all">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full filter blur-3xl opacity-30 -mr-20 -mt-20 group-hover:opacity-50 transition-opacity"></div>
            
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Plus className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-3">Create Room</h2>
              <p className="text-gray-600 mb-6">
                Start a new collaborative whiteboard session and invite your team members to join.
              </p>

              {/* Optional Room Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Name (Optional)
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="My Awesome Board"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span>Instant room creation</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span>Share room link with team</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span>Auto-saved to database</span>
                </div>
              </div>

              <button
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-xl hover:shadow-indigo-200 transition-all hover:scale-105 font-semibold flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isCreating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Room...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create New Room
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Join Room Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200 relative overflow-hidden group hover:shadow-3xl transition-all">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full filter blur-3xl opacity-30 -mr-20 -mt-20 group-hover:opacity-50 transition-opacity"></div>
            
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <LogIn className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-3">Join Room</h2>
              <p className="text-gray-600 mb-6">
                Enter a room ID to join an existing whiteboard session with your team.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room ID
                </label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => {
                      setRoomId(e.target.value);
                      setError('');
                    }}
                    placeholder="room_1234567_abc123"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                    disabled={isJoining}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Ask your teammate for the room ID or link
                </p>
              </div>

              <button
                onClick={handleJoinRoom}
                disabled={isJoining || !roomId.trim()}
            
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-xl hover:shadow-purple-200 transition-all hover:scale-105 font-semibold flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isJoining ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Joining Room...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Join Room
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How it works</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Create a new room to start collaborating, or join an existing room using the room ID. 
                All changes are synced in real-time across all participants. You can draw, add shapes, 
                text, and chat with your team members instantly. All rooms are automatically saved to the database.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Free forever • No credit card required • Unlimited collaborators
          </p>
        </div>
      </div>
    </div>
  );
}