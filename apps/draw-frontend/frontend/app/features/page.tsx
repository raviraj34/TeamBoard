'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Pencil, Users, Zap, Lock, Cloud, MessageSquare,
    Palette, Shapes, Type, Download, History, Grid,
    ArrowRight, Check, Sparkles, Video, Share2, Layers
} from 'lucide-react';

export default function FeaturesPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('collaboration');

    const mainFeatures = [
        {
            icon: <Users className="w-8 h-8" />,
            title: "Real-time Collaboration",
            description: "Work together with unlimited team members in real-time. See cursors, changes, and edits instantly.",
            gradient: "from-indigo-500 to-purple-500"
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: "Lightning Fast",
            description: "Built for speed with instant sync. No lag, no delays - just pure collaborative magic.",
            gradient: "from-purple-500 to-pink-500"
        },
        {
            icon: <MessageSquare className="w-8 h-8" />,
            title: "Built-in Chat",
            description: "Discuss ideas without leaving the canvas. Integrated team chat keeps everyone on the same page.",
            gradient: "from-pink-500 to-red-500"
        },
        {
            icon: <Lock className="w-8 h-8" />,
            title: "Secure & Private",
            description: "End-to-end encryption ensures your work stays private. Your data, your control.",
            gradient: "from-blue-500 to-indigo-500"
        },
        {
            icon: <Cloud className="w-8 h-8" />,
            title: "Auto-save",
            description: "Never lose your work. Everything is automatically saved to the cloud in real-time.",
            gradient: "from-green-500 to-teal-500"
        },
        {
            icon: <History className="w-8 h-8" />,
            title: "Version History",
            description: "Travel back in time. Access previous versions and restore any state of your board.",
            gradient: "from-orange-500 to-red-500"
        }
    ];

    const drawingTools = [
        { icon: <Pencil className="w-6 h-6" />, name: "Free Draw", description: "Natural hand-drawn feel" },
        { icon: <Shapes className="w-6 h-6" />, name: "Shapes", description: "Rectangles, circles, triangles" },
        { icon: <Type className="w-6 h-6" />, name: "Text", description: "Rich text with formatting" },
        { icon: <Palette className="w-6 h-6" />, name: "Colors", description: "Unlimited color options" },
        { icon: <Layers className="w-6 h-6" />, name: "Layers", description: "Organize with layers" },
        { icon: <Grid className="w-6 h-6" />, name: "Grid & Snap", description: "Perfect alignment" }
    ];

    const exportOptions = [
        { name: "PNG", description: "High-quality images" },
        { name: "SVG", description: "Scalable vector graphics" },
        { name: "PDF", description: "Print-ready documents" },
        { name: "JSON", description: "Data export" }
    ];

    const useCases = [
        {
            id: 'collaboration',
            title: "Team Collaboration",
            description: "Perfect for distributed teams working on projects together",
            icon: <Users className="w-6 h-6" />,
            features: ["Unlimited collaborators", "Real-time cursors", "Live chat", "Instant sync"]
        },
        {
            id: 'brainstorming',
            title: "Brainstorming",
            description: "Capture and organize ideas visually with your team",
            icon: <Sparkles className="w-6 h-6" />,
            features: ["Mind mapping", "Sticky notes", "Quick sketches", "Voting system"]
        },
        {
            id: 'education',
            title: "Education",
            description: "Interactive learning and teaching tools for educators",
            icon: <Video className="w-6 h-6" />,
            features: ["Screen sharing", "Student boards", "Annotations", "Recording"]
        },
        {
            id: 'design',
            title: "Design & Wireframing",
            description: "Create mockups and design systems collaboratively",
            icon: <Palette className="w-6 h-6" />,
            features: ["Components library", "Templates", "Design tokens", "Export assets"]
        }
    ];

    const activeUseCase = useCases.find(u => u.id === activeTab);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Navigation */}
            <nav className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => router.push('/')}
                >
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <Pencil className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        DrawFlow
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/')}
                        className="px-4 py-2 text-gray-700 hover:text-indigo-600 transition-colors"
                    >
                        Home
                    </button>
                    <button className="px-4 py-2 text-gray-700 hover:text-indigo-600 transition-colors">
                        Features
                    </button>
                    
                    <button
                        onClick={() => router.push('/joinroom')}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all hover:scale-105 shadow-lg shadow-indigo-200"
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
                <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full mb-6">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">Everything you need to collaborate</span>
                </div>

                <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Powerful Features
                    </span>
                    <br />
                    <span className="text-gray-900">for Modern Teams</span>
                </h1>

                <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
                    Everything you need to create, collaborate, and communicate. From simple sketches to complex diagrams, DrawFlow has you covered.
                </p>

                <button
                    onClick={() => router.push('/joinroom')}
                    className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-2xl hover:shadow-indigo-300 transition-all hover:scale-105 flex items-center gap-2 font-semibold mx-auto"
                >
                    Start Creating Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Main Features Grid */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <h2 className="text-4xl font-bold text-center mb-4">Core Features</h2>
                <p className="text-gray-600 text-center mb-12">Built for teams who demand the best</p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mainFeatures.map((feature, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100"
                        >
                            <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Drawing Tools Section */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-4">Professional Drawing Tools</h2>
                    <p className="text-gray-600 text-center mb-12">Everything you need to bring your ideas to life</p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {drawingTools.map((tool, idx) => (
                            <div
                                key={idx}
                                className="flex items-start gap-4 p-6 rounded-xl hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all flex-shrink-0">
                                    {tool.icon}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">{tool.name}</h3>
                                    <p className="text-sm text-gray-600">{tool.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Use Cases Section */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <h2 className="text-4xl font-bold text-center mb-4">Built for Every Use Case</h2>
                <p className="text-gray-600 text-center mb-12">From startups to enterprises</p>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Tabs */}
                    <div className="space-y-4">
                        {useCases.map((useCase) => (
                            <div
                                key={useCase.id}
                                onClick={() => setActiveTab(useCase.id)}
                                className={`p-6 rounded-2xl cursor-pointer transition-all ${activeTab === useCase.id
                                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl shadow-indigo-200'
                                        : 'bg-white hover:shadow-lg border border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center gap-4 mb-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeTab === useCase.id
                                            ? 'bg-white/20'
                                            : 'bg-indigo-100 text-indigo-600'
                                        }`}>
                                        {useCase.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{useCase.title}</h3>
                                    </div>
                                </div>
                                <p className={activeTab === useCase.id ? 'text-indigo-100' : 'text-gray-600'}>
                                    {useCase.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Active Use Case Details */}
                    <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white">
                                {activeUseCase?.icon}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{activeUseCase?.title}</h3>
                                <p className="text-gray-600">{activeUseCase?.description}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
                            {activeUseCase?.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-gray-800 font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => router.push('/demo')}
                            className="w-full mt-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all hover:scale-105 font-semibold"
                        >
                            Try it Now
                        </button>
                    </div>
                </div>
            </div>


            {/* CTA Section */}
            <div className="max-w-4xl mx-auto px-6 py-24 text-center">
                <h2 className="text-5xl font-bold text-gray-900 mb-6">
                    Ready to Transform Your Collaboration?
                </h2>
                <p className="text-xl text-gray-600 mb-10">
                    Join thousands of teams already using DrawFlow. Start for free, no credit card required.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => router.push('/joinroom')}
                        className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-2xl transition-all hover:scale-105 font-semibold flex items-center gap-2 group"
                    >
                        Get Started Free
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button className="px-8 py-4 bg-white text-gray-700 rounded-xl hover:shadow-xl transition-all border-2 border-gray-200 hover:border-indigo-200 font-semibold">
                        Try Demo
                    </button>
                </div>
                <p className="text-gray-500 mt-6 flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />
                    Free forever • No credit card required
                </p>
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
                    <p className="text-sm">© 2024 DrawFlow. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}