"use client"
import React, { useState, useEffect } from 'react';
import { Pencil, Users, Zap, Download, Lock, Sparkles, ArrowRight, Check, Router, SquarePlus, Airplay } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WhiteboardLanding() {
  const router  =useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  
  
  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Pencil className="w-6 h-6" />, 
      title: "Intuitive Drawing",
      description: "Sketch ideas with natural hand-drawn feel and precision tools"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Real-time Collaboration",
      description: "Work together seamlessly with unlimited team members"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Native desktop performance with instant sync"
    }
  ];

  const benefits = [
    "Unlimited boards and collaborators",
    "End-to-end encryption",
    "Offline mode support",
    "Export to PNG, SVG, PDF",
    "Custom shapes library",
    "Version history"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Pencil className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            DrawFlow
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={()=>{
            router.push("/features")
          }} className="px-4 py-2 text-gray-700 hover:text-indigo-600 transition-colors">
            Features
          </button>
          <button className="px-4 py-2 text-gray-700 hover:text-indigo-600 transition-colors">
            Pricing
          </button>
          <button onClick={()=>{
            router.push("/signin")
          }} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all hover:scale-105 shadow-lg shadow-indigo-200">
            Signin
          </button>
          <button onClick={()=>{
            router.push("/signup")
          }} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all hover:scale-105 shadow-lg shadow-indigo-200">
            Signup
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Free Desktop App for Mac, Windows & Linux</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Visualize Ideas
            </span>
            <br />
            <span className="text-gray-900">Together, Instantly</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            The collaborative whiteboard that feels like magic. Draw, brainstorm, and create together in real-time with your team.
          </p>

          <div className="flex items-center justify-center gap-4 mb-16">
            <button onClick={()=>{
              router.push("/joinroom")
            }} className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-2xl hover:shadow-indigo-300 transition-all hover:scale-105 flex items-center gap-2 font-bold">
              <Airplay className="w-5 h-5" />
              Join room
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={()=>{
              router.push("/demo")
            }} className="px-8 py-4 bg-white text-gray-700 rounded-xl hover:shadow-xl transition-all border-2 border-gray-200 hover:border-indigo-200 font-semibold">
              Try in Browser
            </button>
          </div>

        
          <div className={`relative transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-50"></div>
              
              {/* Mock Canvas */}
              <div className="relative bg-white rounded-lg h-96 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-8 p-8">
                  {features.map((feature, idx) => (
                    <div
                      key={idx}
                      className={`transform transition-all duration-500 ${
                        activeFeature === idx ? 'scale-110 -rotate-2' : 'scale-100 rotate-0'
                      }`}
                    >
                      <div className={`p-6 rounded-xl border-2 ${
                        activeFeature === idx 
                          ? 'bg-gradient-to-br from-indigo-100 to-purple-100 border-indigo-400 shadow-lg' 
                          : 'bg-white border-gray-200'
                      }`}>
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                          activeFeature === idx 
                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {feature.icon}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to collaborate
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features that make teamwork effortless
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-4 p-6 rounded-xl hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 transition-all hover:shadow-lg group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{benefit}</h3>
                  <p className="text-gray-600 text-sm">Works seamlessly across all platforms</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Start creating together today
          </h2>
          <p className="text-xl text-indigo-100 mb-10">
            Join thousands of teams already using DrawFlow for brainstorming, planning, and creative collaboration.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="px-8 py-4 bg-white text-indigo-600 rounded-xl hover:shadow-2xl transition-all hover:scale-105 font-bold flex items-center gap-2 group">
              <Download className="w-5 h-5" />
              Create Now 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <p className="text-indigo-100 mt-6 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            No credit card required · Free forever
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Pencil className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">DrawFlow</span>
          </div>
          <p className="mb-4">The collaborative whiteboard for modern teams</p>
          <p className="text-sm">© 2025 DrawFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}