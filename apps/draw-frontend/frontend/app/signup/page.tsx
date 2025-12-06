"use client"
import React, { useState } from 'react';
import { Pencil, Mail, Lock, Eye, EyeOff, Github, Chrome, ArrowRight, Sparkles, User, Check } from 'lucide-react';
import { HTTP_URL } from '../config';
import { useRouter } from 'next/navigation';
import Loader from '../../components/loader';
export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    name:""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const router= useRouter();
 //@ts-ignore
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'password') {
      // Calculate password strength
      let strength = 0;
      if (value.length >= 8) strength++;
      if (value.match(/[a-z]/) && value.match(/[A-Z]/)) strength++;
      if (value.match(/[0-9]/)) strength++;
      if (value.match(/[^a-zA-Z0-9]/)) strength++;
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = () => {
    if (!formData.agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    try{
      const res = fetch(`${HTTP_URL}/signup`,{
        method:"post",
        headers:{
          "content-type": "application/json",
        },
        body:JSON.stringify({
          email:formData.email,
          password:formData.password,
          name:formData.name
        }),

      })
    }catch(e){
      alert("signup error..!!!!")

    }
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      <Loader />
      router.push("/signin")
    }, 2000);
  };

  const handleSocialSignup = (provider: string) => {
    alert(`Signing up with ${provider}`);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200';
    if (passwordStrength === 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-yellow-500';
    if (passwordStrength === 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength === 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
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
              Start creating
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                amazing things
              </span>
            </h1>
            
            <p className="text-xl text-gray-600">
              Join thousands of teams already using DrawFlow to bring their ideas to life.
            </p>

            {/* Benefits List */}
            <div className="space-y-4 pt-4">
              {[
                'Unlimited boards and projects',
                'Real-time collaboration with team',
                'Advanced drawing and design tools',
                'Export to multiple formats',
                'Priority customer support'
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Social Proof */}
            <div className="mt-12 p-6 bg-white rounded-2xl shadow-xl border border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-white ${
                      i === 1 ? 'bg-gradient-to-br from-indigo-400 to-indigo-600' :
                      i === 2 ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
                      i === 3 ? 'bg-gradient-to-br from-pink-400 to-pink-600' :
                      'bg-gradient-to-br from-blue-400 to-blue-600'
                    }`}></div>
                  ))}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">10,000+ users</div>
                  <div className="text-xs text-gray-600">joined this month</div>
                </div>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Sparkles key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                "DrawFlow transformed how our team collaborates. Absolutely amazing!"
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
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
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create account</h2>
                <p className="text-gray-600">Get started with your free account today</p>
              </div>

              {/* Social Signup Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleSocialSignup('Google')}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-lg transition-all group"
                >
                  <Chrome className="w-5 h-5 text-gray-700 group-hover:text-indigo-600 transition-colors" />
                  <span className="font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">Continue with Google</span>
                </button>
                
                <button
                  onClick={() => handleSocialSignup('GitHub')}
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
                  <span className="px-4 bg-white text-gray-500 font-medium">Or sign up with email</span>
                </div>
              </div>

              {/* Sign Up Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 text-gray-400 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
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
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Create a strong password"
                      className="w-full text-gray-400 pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              i <= passwordStrength ? getPasswordStrengthColor() : 'bg-gray-200'
                            }`}
                          ></div>
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${
                        passwordStrength <= 1 ? 'text-red-600' :
                        passwordStrength === 2 ? 'text-yellow-600' :
                        passwordStrength === 3 ? 'text-blue-600' :
                        'text-green-600'
                      }`}>
                        {getPasswordStrengthText()}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full text-gray-400 pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the{' '}
                      <button type="button" className="text-indigo-600 hover:text-indigo-700 font-medium">
                        Terms of Service
                      </button>
                      {' '}and{' '}
                      <button type="button" className="text-indigo-600 hover:text-indigo-700 font-medium">
                        Privacy Policy
                      </button>
                    </span>
                  </label>
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
                      Create Account
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              {/* Sign In Link */}
              <p className="text-center text-gray-600 mt-6">
                Already have an account?{' '}
                <button onClick={()=>{
                  router.push("/signin")
                }} className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                  Sign in
                </button>
              </p>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Lock className="w-4 h-4" />
            <span>Free forever · No credit card required</span>
          </div>
        </div>
      </div>
    </div>
  );
}