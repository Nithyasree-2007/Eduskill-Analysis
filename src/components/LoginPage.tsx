import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Building2,
  BookOpen,
  Brain,
  Database,
  Award,
  TrendingUp,
  CheckCircle2,
  Camera,
} from 'lucide-react';
import { AuthUser, StudentProfile } from '../types';
import { authService } from '../services/authService';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser, profile: StudentProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [institution, setInstitution] = useState<string>('');
  const [degree, setDegree] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleQuickFill = (name: string, mail: string, inst: string, deg: string) => {
    setFullName(name);
    setEmail(mail);
    setInstitution(inst);
    setDegree(deg);
    setPassword('student123');
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your institutional email or student ID');
      return;
    }

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = authService.login({
        fullName: fullName.trim(),
        email: email.trim(),
        institution: institution.trim(),
        degree: degree.trim(),
        role: role === 'faculty' ? 'faculty' : 'student',
      });
      setIsLoading(false);
      if (res.success) {
        onLoginSuccess(res.user, res.profile);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Branding / Value Proposition Column */}
        <div className="lg:col-span-6 space-y-6 text-white pr-0 lg:pr-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span>Smart Education & Student Analytics</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Map Student Skills against{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
              Industry Demands
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
            Empowering students with Big Data analytics on 1.3M LinkedIn job postings, ML readiness prediction, and personalized certification roadmaps.
          </p>

          {/* Key Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">1.3M Job Benchmark</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Empirical tech industry skill frequency & demand.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 shrink-0">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">ML Readiness Model</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Cosine similarity + Random Forest classification.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-600/20 text-amber-400 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">Smart Certifications</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Automated courses targeted to missing competencies.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">Score History Audit</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Track and persist readiness progress across sessions.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Authentication Card Column */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
          <div className="space-y-1 mb-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Academic Portal Login
              </h2>
              <span className="text-[11px] px-2 py-0.5 font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                Direct Profile Access
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Sign in with your name and institutional credentials to immediately load your personal student profile.
            </p>
          </div>

          {/* Role Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`py-2 rounded-lg transition-all ${
                role === 'student'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student Candidate
            </button>
            <button
              type="button"
              onClick={() => setRole('faculty')}
              className={`py-2 rounded-lg transition-all ${
                role === 'faculty'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Faculty / Placement Cell
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name (e.g. Vinutha R)"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional Email or Student ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter student email (e.g. student@university.edu)"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-600 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  University / College <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Enter your college / institute"
                    className="w-full pl-8 pr-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department / Degree <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. B.Tech IT, B.E CSE"
                    className="w-full pl-8 pr-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-600 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-indigo-600 hover:underline cursor-pointer">
                  Forgot credentials?
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Remember this session</span>
              </label>
              <span className="text-slate-400 text-[11px]">Academic Year 2024-25</span>
            </div>

            {/* Direct Setup Notice */}
            <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-2 text-xs text-indigo-900">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Your profile is immediately generated with <strong>{fullName || 'your name'}</strong>. You can click your profile photo in the top bar to update degree details, upload an avatar photo, and customize skills.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isLoading ? (
                <span>Logging In & Initializing Profile...</span>
              ) : (
                <>
                  <span>Sign In to Student Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo Fill Helper */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-500">
              <span>Quick demo accounts:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill('Vinutha R', 'vinutha.r@bitsathy.ac.in', '', '')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-medium transition-colors cursor-pointer"
                >
                  Vinutha R (Fresh)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('Aarav Sharma', 'aarav.it22@bitsathy.ac.in', 'Bannari Amman Institute of Technology', 'B.Tech IT')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-medium transition-colors cursor-pointer"
                >
                  Aarav S (Demo)
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
