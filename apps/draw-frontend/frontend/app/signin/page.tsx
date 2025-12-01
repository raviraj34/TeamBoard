"use client"
import React, { useState } from 'react';
import { Pencil, Mail, Lock, Eye, EyeOff, Github, Chrome, ArrowRight, Sparkles } from 'lucide-react';
import { link } from 'fs';
import { useRouter } from 'next/navigation';
export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

const router = useRouter();

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3001/backend/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Invalid credentials");
        setIsLoading(false);
        return;
      }

      // SAVE TOKEN TO LOCAL STORAGE
      localStorage.setItem("authntication", data.token);
      router.push("/joinroom")
      setTimeout(() => {
        alert('Sign in successful!');
      }, data);
    } catch (e) {
      alert("something went wrong!!!")
    } finally {

      setIsLoading(false);
    }
  }
    //@ts-ignore
    const handleSocialLogin = (provider) => {
      alert(`Logging in with ${provider}`);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>
        </div>

        {/* Main Container */}
        <div className="relative w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">

          {/* Left Side - Branding */}
          <div className="hidden md:block">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Pencil className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  DrawFlow
                </span>
              </div>

              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                Welcome back to your
                <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  creative space
                </span>
              </h1>

              <p className="text-xl text-gray-600">
                Sign in to access your boards and collaborate with your team in real-time.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3 pt-4">
                {['Unlimited Boards', 'Real-time Sync', 'Team Collaboration'].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Decorative Canvas */}
              <div className="mt-12 p-6 bg-white rounded-2xl shadow-xl border border-gray-200">
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className={`h-16 rounded-lg ${i === 1 ? 'bg-gradient-to-br from-indigo-200 to-indigo-300' : i === 2 ? 'bg-gradient-to-br from-purple-200 to-purple-300' : 'bg-gradient-to-br from-pink-200 to-pink-300'}`}></div>
                      <div className="h-2 bg-gray-200 rounded-full w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded-full w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Sign In Form */}
          <div className="w-full">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200 relative overflow-hidden">
              {/* Gradient Overlay */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full filter blur-3xl opacity-30 -mr-32 -mt-32"></div>

              <div className="relative">
                {/* Mobile Logo */}
                <div className="md:hidden flex items-center justify-center gap-2 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <Pencil className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    DrawFlow
                  </span>
                </div>

                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h2>
                  <p className="text-gray-600">Enter your credentials to access your account</p>
                </div>

                {/* Social Login Buttons */}
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => handleSocialLogin('Google')}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-lg transition-all group"
                  >
                    <Chrome className="w-5 h-5 text-gray-700 group-hover:text-indigo-600 transition-colors" />
                    <span className="font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">Continue with Google</span>
                  </button>

                  <button
                    onClick={() => handleSocialLogin('GitHub')}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-lg transition-all group"
                  >
                    <Github className="w-5 h-5 text-gray-700 group-hover:text-indigo-600 transition-colors" />
                    <span className="font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">Continue with GitHub</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">Or continue with email</span>
                  </div>
                </div>

                {/* Email/Password Form */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                      Forgot password?
                    </button>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-xl hover:shadow-indigo-200 transition-all hover:scale-105 font-semibold flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>

                {/* Sign Up Link */}
                <p className="text-center text-gray-600 mt-6">
                  Don't have an account?{' '}
                  <button className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                    Sign up for free
                  </button>
                </p>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              <span>Your data is secure and encrypted</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

