import React, { useState, useEffect } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  Briefcase,
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  Target,
  Sparkles,
  Zap,
  TrendingUp,
  Plus,
  History,
  Bookmark,
  ArrowUpRight,
  Camera,
} from 'lucide-react';
import { JOB_ROLES } from '../data/industryDataset';
import {
  CertificationRecommendation,
  MLPredictionResult,
  ReadinessScoreSnapshot,
  SkillGapItem,
  StudentProfile,
} from '../types';
import { historyStorageService } from '../services/historyStorage';

interface StudentDashboardProps {
  student: StudentProfile;
  selectedRoleId: string;
  onSelectRole: (roleId: string) => void;
  prediction: MLPredictionResult;
  gaps: SkillGapItem[];
  acquiredCount: number;
  criticalMissingCount: number;
  radarData: { skill: string; student: number; industry: number; fullMark: number }[];
  recommendations: CertificationRecommendation[];
  onSkillProficiencyChange: (skillId: string, newLevel: number) => void;
  onOpenAIAdvisor: () => void;
  onNavigateToHistory?: () => void;
  onOpenProfileModal?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  selectedRoleId,
  onSelectRole,
  prediction,
  gaps,
  acquiredCount,
  criticalMissingCount,
  radarData,
  recommendations,
  onSkillProficiencyChange,
  onOpenAIAdvisor,
  onNavigateToHistory,
  onOpenProfileModal,
}) => {
  const currentRole = JOB_ROLES.find((r) => r.id === selectedRoleId) || JOB_ROLES[0];
  const [recentSnapshots, setRecentSnapshots] = useState<ReadinessScoreSnapshot[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load history from local storage
  const loadSnapshots = () => {
    const records = historyStorageService.getStudentHistory(student.id);
    setRecentSnapshots(records);
  };

  useEffect(() => {
    loadSnapshots();

    const handleStorageEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.studentId === student.id) {
        loadSnapshots();
      }
    };

    window.addEventListener('readiness-history-updated', handleStorageEvent);
    return () => {
      window.removeEventListener('readiness-history-updated', handleStorageEvent);
    };
  }, [student.id]);

  const handleQuickSaveSnapshot = () => {
    const topMissingNames = gaps
      .filter((g) => g.gapDelta > 0)
      .slice(0, 3)
      .map((g) => g.skillName);

    const saved = historyStorageService.saveSnapshot({
      studentId: student.id,
      roleId: currentRole.id,
      roleTitle: currentRole.title,
      readinessScore: prediction.readinessScore,
      readinessTier: prediction.readinessTier,
      confidenceScore: prediction.confidenceScore,
      criticalSkillCoverage: prediction.criticalSkillCoverage,
      acquiredSkillsCount: acquiredCount,
      criticalMissingCount: criticalMissingCount,
      topGaps: topMissingNames,
      note: `Live assessment for ${currentRole.title} (${prediction.readinessScore}% - ${prediction.readinessTier})`,
      trigger: 'manual',
    });

    loadSnapshots();
    setToastMessage(`Logged ${saved.readinessScore}% snapshot to local storage!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const firstRecord = recentSnapshots.length > 0 ? recentSnapshots[0] : null;
  const growth = firstRecord ? prediction.readinessScore - firstRecord.readinessScore : 0;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Industry Ready':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Job Competent':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Developing':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-rose-700 bg-rose-50 border-rose-200';
    }
  };

  const getTierProgressColor = (tier: string) => {
    switch (tier) {
      case 'Industry Ready':
        return 'bg-emerald-500';
      case 'Job Competent':
        return 'bg-blue-600';
      case 'Developing':
        return 'bg-amber-500';
      default:
        return 'bg-rose-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Fresh Profile Onboarding Prompt Banner */}
      {student.skills.length === 0 && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50 via-slate-50 to-emerald-50 border-2 border-dashed border-indigo-300 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Welcome to Your Student Portal, {student.name}!
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Profile Setup Required
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Before computing your ML readiness score and skill gap roadmap, please enter your academic credentials (Institution, Degree, CGPA) and add your acquired skills. Click your profile photo or the button on the right to start.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenProfileModal}
            className="shrink-0 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Enter Credentials & Add Skills</span>
          </button>
        </div>
      )}

      {/* Top Banner: Student Summary & Target Role Selection */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Interactive Profile Photo */}
            <button
              type="button"
              onClick={onOpenProfileModal}
              className="relative group shrink-0 cursor-pointer focus:outline-hidden"
              title="Click profile photo to update academic info, target role, and skills"
            >
              {student.avatarUrl ? (
                <img
                  src={student.avatarUrl}
                  alt={student.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-indigo-600 shadow-xs group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-xs group-hover:bg-indigo-700 transition-colors">
                  {student.avatarInitials || student.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 p-1 bg-white text-indigo-600 rounded-full border border-slate-200 shadow-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Camera className="w-3.5 h-3.5" />
              </span>
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Student Profile
                </span>
                <span className="text-xs text-slate-500">
                  {student.university || 'Institution: Not entered'} • {student.degree || 'Degree: Not entered'} {student.year > 0 ? `• Yr ${student.year}` : ''} • {student.gpa > 0 ? `CGPA: ${student.gpa}/10` : 'CGPA: Not entered'}
                </span>
                {onOpenProfileModal && (
                  <button
                    type="button"
                    onClick={onOpenProfileModal}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                  >
                    (Edit Info via Photo)
                  </button>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{student.name}</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                {student.bio || (student.skills.length === 0 ? 'Fresh student profile. Click your profile photo to enter your academic credentials and add acquired skills.' : `${student.degree || 'Candidate'} preparing for industry career readiness.`)}
              </p>
            </div>
          </div>

          {/* Role Selector Box */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600 shrink-0" />
              <label htmlFor="select-target-role" className="text-xs font-medium text-slate-600">Target Role:</label>
            </div>
            <select
              id="select-target-role"
              value={selectedRoleId}
              onChange={(e) => onSelectRole(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              {JOB_ROLES.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.title} ({role.totalJobPostings.toLocaleString()} LinkedIn jobs)
                </option>
              ))}
            </select>
            <div className="text-xs text-slate-500 pl-1 hidden xl:block">
              Avg: <span className="font-semibold text-slate-700">${Math.round(currentRole.avgAnnualSalaryUsd / 1000)}k/yr</span> ({currentRole.avgAnnualSalaryInrLpa} LPA)
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: ML Readiness Score */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                ML Readiness Score
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${student.skills.length === 0 ? 'text-amber-700 bg-amber-50 border-amber-200' : getTierColor(prediction.readinessTier)}`}>
                {student.skills.length === 0 ? 'Awaiting Skills' : prediction.readinessTier}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {prediction.readinessScore}%
              </span>
              <span className="text-xs text-slate-500">
                {student.skills.length === 0 ? '0 Skills Added' : `Confidence: ${Math.round(prediction.confidenceScore * 100)}%`}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${getTierProgressColor(prediction.readinessTier)}`}
                style={{ width: `${prediction.readinessScore}%` }}
              ></div>
            </div>
            <div className="mt-2 text-xs text-slate-500 flex justify-between">
              <span>{student.skills.length === 0 ? 'Vector match: Pending' : `Vector Match: ${(prediction.cosineSimilarity * 100).toFixed(0)}%`}</span>
              <span>{student.skills.length === 0 ? 'Add skills in profile' : `Est: ~${prediction.estimatedWeeksToReady} wks`}</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={handleQuickSaveSnapshot}
              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
              title="Save current readiness evaluation to LocalStorage history"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Log Snapshot</span>
            </button>
            {onNavigateToHistory && (
              <button
                onClick={onNavigateToHistory}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
              >
                <span>View History</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Metric 2: Critical Skill Gaps */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Critical Skill Gaps
            </span>
            <AlertTriangle className={`w-4 h-4 ${criticalMissingCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {criticalMissingCount}
            </span>
            <span className="text-xs text-slate-500">
              of {currentRole.skills.filter((s) => s.isCritical).length} mandatory skills
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-600">
            {student.skills.length === 0
              ? 'Add your acquired skills in profile to assess critical role requirements.'
              : criticalMissingCount > 0
              ? 'Urgent blockers required by >85% of tech job descriptions.'
              : 'All mandatory foundational skills acquired! Excellent profile.'}
          </p>
        </div>

        {/* Metric 3: Skills Acquired */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Skills Acquired
            </span>
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {acquiredCount}
            </span>
            <span className="text-xs text-slate-500">
              of {currentRole.skills.length} role requirements
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="h-2 rounded-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${Math.round((acquiredCount / Math.max(1, currentRole.skills.length)) * 100)}%` }}
            ></div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Coverage: {Math.round((acquiredCount / Math.max(1, currentRole.skills.length)) * 100)}%
          </p>
        </div>

        {/* Metric 4: Certifications & Portfolio */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Portfolio & Certs
            </span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {student.projects.length}
            </span>
            <span className="text-xs text-slate-500">
              Projects • {student.completedCertifications.length} Certs
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-600">
            ML Boost: <span className="font-semibold text-emerald-600">+{prediction.certificationBoost}% score</span> from accredited credentials.
          </p>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-indigo-600 hover:text-indigo-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Local Storage Readiness History Progression Widget */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <History className="w-4 h-4 text-indigo-600" />
                Readiness Score Progression (LocalStorage History)
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                {recentSnapshots.length} Evaluations Saved
              </span>
              {growth !== 0 && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${growth > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  {growth > 0 ? `+${growth}%` : `${growth}%`} Growth
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Audited historical readiness checkpoints persisted across sessions for {student.name}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleQuickSaveSnapshot}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Log Current Score</span>
            </button>
            {onNavigateToHistory && (
              <button
                onClick={onNavigateToHistory}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Score History Tab</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Progression Pills Timeline */}
        {recentSnapshots.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              Trajectory:
            </span>
            {recentSnapshots.slice(-5).map((snap, idx) => (
              <div
                key={snap.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 shrink-0"
              >
                <span className="text-[10px] text-slate-400">
                  {new Date(snap.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="font-bold text-slate-800">
                  {snap.readinessScore}%
                </span>
                <span className={`text-[9px] px-1 py-0.2 rounded font-medium border ${getTierColor(snap.readinessTier)}`}>
                  {snap.readinessTier.split(' ')[0]}
                </span>
                {idx < Math.min(recentSnapshots.length, 5) - 1 && (
                  <span className="text-slate-300 ml-1">→</span>
                )}
              </div>
            ))}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 shrink-0">
              <span className="text-[10px] text-indigo-500 font-semibold">Live Now:</span>
              <span className="font-extrabold text-indigo-700">
                {prediction.readinessScore}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Radar Chart & Skill Gap Priority List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Radar Comparison & Market Role Blueprint */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Skill Competency Mapping vs Industry Benchmark
                </h3>
                <p className="text-xs text-slate-500">
                  Compares current student skill vectors against 1.3M LinkedIn job posting requirements.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 bg-slate-100 rounded-md font-medium text-slate-600">
                1–5 Proficiency Scale
              </span>
            </div>

            {/* Radar Chart Container */}
            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: '#475569', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      `${value} / 5`,
                      name === 'student' ? 'Student Level' : 'Industry Required',
                    ]}
                  />
                  <Radar
                    name="Student Level"
                    dataKey="student"
                    stroke="#4f46e5"
                    fill="#4f46e5"
                    fillOpacity={0.4}
                  />
                  <Radar
                    name="Industry Required"
                    dataKey="industry"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.15}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
                <span className="text-slate-700 font-medium">Student Current Proficiency</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="text-slate-700 font-medium">Industry Role Target</span>
              </div>
            </div>
          </div>

          {/* Role Quick Facts */}
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs bg-slate-50/70 p-3 rounded-xl">
            <div>
              <span className="text-slate-500 block">Top Employers:</span>
              <span className="font-semibold text-slate-800">
                {currentRole.topHiringCompanies.slice(0, 3).join(', ')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Experience Level:</span>
              <span className="font-semibold text-slate-800">
                {currentRole.experienceLevel} • High Demand
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Skill Gap Analysis */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Targeted Skill Gap Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Prioritized by market scarcity, role criticality, and delta to mastery.
              </p>
            </div>
            <button
              onClick={onOpenAIAdvisor}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-md"
            >
              <Sparkles className="w-3 h-3" />
              AI Plan
            </button>
          </div>

          {/* Gaps List */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {gaps.map((gap) => (
              <div
                key={gap.skillId}
                className={`p-3.5 rounded-xl border transition-all ${
                  gap.urgency === 'Critical'
                    ? 'bg-rose-50/40 border-rose-200'
                    : gap.gapDelta > 0
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-emerald-50/30 border-emerald-200/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{gap.skillName}</span>
                    {gap.isCritical && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-700 uppercase tracking-wider">
                        Mandatory
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded-sm bg-white border border-slate-200 hidden sm:inline">
                      {gap.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Level: <span className="text-indigo-600">{gap.currentLevel}</span> / {gap.requiredLevel}
                    </span>
                    {/* Interactive Level Incrementer for simulation */}
                    <button
                      id={`btn-boost-${gap.skillId}`}
                      onClick={() => onSkillProficiencyChange(gap.skillId, Math.min(5, gap.currentLevel + 1))}
                      disabled={gap.currentLevel >= 5}
                      className="p-1 text-xs text-indigo-600 hover:bg-indigo-100 rounded-md transition-colors disabled:opacity-40"
                      title="Simulate training progress: +1 Level"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar and Delta */}
                <div className="mt-2.5">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Current: Level {gap.currentLevel}</span>
                    <span>
                      {gap.gapDelta > 0 ? (
                        <span className="text-rose-600 font-semibold">Gap: -{gap.gapDelta} level{gap.gapDelta > 1 ? 's' : ''}</span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">Requirement Satisfied</span>
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        gap.gapDelta === 0 ? 'bg-emerald-500' : gap.urgency === 'Critical' ? 'bg-rose-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${(gap.currentLevel / gap.requiredLevel) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Market Weight: {gap.marketDemand}% of job postings</span>
                  <span className="font-medium text-slate-700">
                    Priority Score: {gap.priorityScore}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recommended Industry Certifications */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Recommended Certifications to Bridge Identified Gaps
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Accredited credentials algorithmically mapped to eliminate your top skill deficiencies.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md self-start sm:self-auto">
            Top {recommendations.slice(0, 3).length} High-Impact Matches
          </span>
        </div>

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.slice(0, 3).map((rec) => (
            <div
              key={rec.certification.id}
              className="p-4 rounded-xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all bg-slate-50/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                    {rec.certification.provider}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    +{rec.expectedReadinessUplift}% Readiness Boost
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 line-clamp-2">
                  {rec.certification.title}
                </h4>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                  {rec.certification.careerOutcome}
                </p>

                {/* Skills Targeted Chips */}
                <div className="mt-3">
                  <span className="text-[11px] font-medium text-slate-500 block mb-1.5">
                    Closes Gaps In:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {rec.targetedGaps.map((skillId) => (
                      <span
                        key={skillId}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-100/70 text-indigo-800"
                      >
                        {skillId.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Meta */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>~{rec.certification.durationWeeks} wks</span>
                  <span>•</span>
                  <span>{rec.certification.isFreeOrFinancialAid ? 'Aid Available' : `$${rec.certification.costUsd}`}</span>
                </div>
                <a
                  href={rec.certification.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  <span>View</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
