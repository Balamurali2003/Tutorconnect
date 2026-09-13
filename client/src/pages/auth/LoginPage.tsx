import { BrandLogo } from '../../components/common/BrandLogo';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, addToast } = useApp();

  // Role selection: defaults to 'Tutor' without pre-filling credentials
  const [role, setRole] = useState<'Admin' | 'Tutor' | 'Parent'>('Tutor');

  // Username and password strictly start EMPTY
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRoleChange = (newRole: 'Admin' | 'Tutor' | 'Parent') => {
    setRole(newRole);
    setErrorMessage(null);
    // Ensure fields remain strictly empty on role switch
    setUsername('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validation
    if (!username.trim()) {
      setErrorMessage('Please enter your username.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      await login({
        role,
        username: username.trim(),
        password: password.trim()
      });
      addToast('success', 'Sign In Successful', 'Welcome to Charithra Learning Hub.');
    } catch (err: any) {
      // Professional generic error message without revealing account existence
      const msg = err.message || '';
      if (msg.includes('not active yet') || msg.includes('not yet activated')) {
        setErrorMessage('Your tutor account is not active yet. Please contact the administrator.');
      } else {
        setErrorMessage('Invalid username or password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-12 selection:bg-indigo-500 selection:text-white">
      {/* Top Mobile/Small Screen Branding Bar */}
      <div className="lg:hidden flex items-center justify-center mb-6 py-2">
        <BrandLogo mode="full" size="sm" />
      </div>

      {/* Main Two-Column Container */}
      <div className="max-w-6xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
        {/* LEFT COLUMN: Educational Branding & Identity */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-8 pr-4">
          {/* Brand Header */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-bold mb-5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Dedicated Tuition & Academic Excellence</span>
            </div>

            <div className="mb-4">
              <BrandLogo mode="full" size="xl" className="items-start" />
            </div>

            <div className="w-20 h-1 bg-gradient-to-r from-amber-500 to-indigo-600 rounded-full my-4" />

            <p className="text-base text-slate-700 font-semibold leading-relaxed max-w-lg">
              Empowering Learning. Connecting Tutors, Students &amp; Parents.
            </p>
          </div>

          {/* Educational Feature Cards */}
          <div className="space-y-3.5 pt-2 max-w-lg">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/70 shadow-xs hover:border-slate-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Personalized Tutoring</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Tailored curriculum coaching in Mathematics, Science, and languages across standard grades.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/70 shadow-xs hover:border-slate-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Daily Learning Reports</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Continuous transparency with topic coverage, homework assignments, and photo feedback.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/70 shadow-xs hover:border-slate-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Verified Appointed Mentors</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Rigorous document verification, interview evaluation, and subject excellence standards.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Modern, Clean Login Card */}
        <div className="w-full lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8 sm:p-10">
            {/* Card Header with Centered Official Logo Lockup */}
            <div className="mb-6 text-center">
              <BrandLogo mode="full" size="md" className="mx-auto mb-3" />
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Sign in to continue to your learning portal
              </p>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-left" noValidate>
              {/* Role Segmented Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Login as:
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('Admin')}
                    className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      role === 'Admin'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('Tutor')}
                    className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      role === 'Tutor'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    Tutor
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('Parent')}
                    className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      role === 'Parent'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    Parent
                  </button>
                </div>
              </div>

              {/* Username Input Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password Input Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-11 py-3 bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Subtle Security Badge */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Secure Learning Management Portal</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Page Footer */}
      <footer className="w-full max-w-6xl mx-auto pt-6 text-center text-xs text-slate-400 font-medium">
        &copy; 2026 Charithra Learning Hub. All rights reserved.
      </footer>
    </div>
  );
};

export default LoginPage;
