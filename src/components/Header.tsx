import React from 'react';
import {
  GraduationCap,
  Database,
  Sparkles,
  Presentation,
  UserCheck,
  Layers,
  LogOut,
  Camera,
  ChevronDown,
} from 'lucide-react';
import { AuthUser, StudentProfile } from '../types';

interface HeaderProps {
  students: StudentProfile[];
  selectedStudent: StudentProfile;
  onSelectStudent: (student: StudentProfile) => void;
  onOpenProfileModal: () => void;
  onOpenAIModal: () => void;
  isPresentationMode: boolean;
  onTogglePresentationMode: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  students,
  selectedStudent,
  onSelectStudent,
  onOpenProfileModal,
  onOpenAIModal,
  isPresentationMode,
  onTogglePresentationMode,
  activeTab,
  onSelectTab,
  currentUser,
  onLogout,
}) => {
  const isFaculty = currentUser?.role === 'faculty' || currentUser?.role === 'placement_officer';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  EduSkill Analytics
                </h1>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Student Skill Gap Analysis & Certification Recommendation Engine
              </p>
            </div>
          </div>

          {/* Center: Dataset Status */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Benchmark:</span>
            <span className="font-semibold text-slate-800">1.3M LinkedIn Jobs (2024)</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1"></span>
          </div>

          {/* Right Controls: Student Profile Photo & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Student Profile Card with Photo Click Action */}
            <button
              type="button"
              onClick={onOpenProfileModal}
              className="group flex items-center gap-2.5 p-1 sm:pr-3 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer text-left shadow-2xs"
              title="Click photo to customize profile photo, skills, and academic information"
            >
              <div className="relative shrink-0">
                {selectedStudent.avatarUrl ? (
                  <img
                    src={selectedStudent.avatarUrl}
                    alt={selectedStudent.name}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-indigo-600 shadow-2xs group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs group-hover:bg-indigo-700 transition-colors">
                    {selectedStudent.avatarInitials || selectedStudent.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {/* Camera / Edit Badge */}
                <span className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-white text-indigo-600 rounded-full border border-slate-200 shadow-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Camera className="w-2.5 h-2.5" />
                </span>
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 leading-tight truncate max-w-[120px] sm:max-w-[160px]">
                    {selectedStudent.name}
                  </span>
                  <span className="text-[10px] text-indigo-600 font-semibold hidden md:inline">
                    (Edit Info)
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight truncate max-w-[120px] sm:max-w-[160px]">
                  {selectedStudent.gpa > 0 ? (
                    `${(selectedStudent.degree || 'Degree').split(' ')[0]} Yr ${selectedStudent.year} • CGPA ${selectedStudent.gpa}`
                  ) : (
                    <span className="text-amber-600 font-medium">Click to Enter Info</span>
                  )}
                </span>
              </div>
            </button>

            {/* If faculty, allow cohort selection dropdown */}
            {isFaculty && students.length > 1 && (
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
                <span className="text-slate-400 text-[10px] hidden sm:inline">Cohort:</span>
                <select
                  aria-label="Select cohort student"
                  value={selectedStudent.id}
                  onChange={(e) => {
                    const s = students.find((item) => item.id === e.target.value);
                    if (s) onSelectStudent(s);
                  }}
                  className="bg-transparent font-medium text-slate-700 focus:outline-hidden cursor-pointer text-xs"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* AI Advisor Button */}
            <button
              id="btn-open-ai-advisor"
              onClick={onOpenAIModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">AI Advisor</span>
            </button>

            {/* Stakeholder Presentation Button */}
            <button
              id="btn-toggle-presentation-mode"
              onClick={onTogglePresentationMode}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shadow-xs ${
                isPresentationMode
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isPresentationMode ? <Layers className="w-3.5 h-3.5" /> : <Presentation className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isPresentationMode ? 'Exit Deck' : 'Stakeholder Deck'}</span>
            </button>

            {/* User Session Logout */}
            {currentUser && onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                title={`Sign out (${currentUser.name})`}
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      {!isPresentationMode && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 no-scrollbar border-t border-slate-100">
            {[
              { id: 'dashboard', label: 'Student Skill Gap & Readiness' },
              { id: 'readiness_history', label: 'Score History & Progress' },
              { id: 'analytics', label: '1.3M Dataset Analytics' },
              { id: 'ml_model', label: 'ML Prediction & Evaluation' },
              { id: 'preprocessing', label: 'Data Preprocessing & Pipeline' },
              { id: 'certifications', label: 'Certifications & Roadmap' },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`tab-nav-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
