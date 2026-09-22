import React, { useState, useMemo } from 'react';
import { SAMPLE_STUDENTS } from './data/studentDataset';
import { JOB_ROLES } from './data/industryDataset';
import { Header } from './components/Header';
import { StudentDashboard } from './components/StudentDashboard';
import { AnalyticsView } from './components/AnalyticsView';
import { MLModelView } from './components/MLModelView';
import { PreprocessingView } from './components/PreprocessingView';
import { CertificationsView } from './components/CertificationsView';
import { PresentationView } from './components/PresentationView';
import { StudentProfileModal } from './components/StudentProfileModal';
import { AIAdvisorModal } from './components/AIAdvisorModal';
import { ReadinessHistoryView } from './components/ReadinessHistoryView';
import { LoginPage } from './components/LoginPage';
import { predictStudentReadiness } from './services/mlModel';
import { analyzeSkillGaps } from './services/gapAnalysis';
import { generateCertificationRecommendations } from './services/recommendation';
import { authService } from './services/authService';
import { AuthUser, StudentProfile } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());
  const [students, setStudents] = useState<StudentProfile[]>(() => {
    const user = authService.getCurrentUser();
    if (user && user.studentProfileId) {
      const saved = authService.getStudentProfile(user.studentProfileId);
      if (saved) {
        return [saved, ...SAMPLE_STUDENTS.filter((s) => s.id !== saved.id)];
      }
    }
    return SAMPLE_STUDENTS;
  });
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    const user = authService.getCurrentUser();
    return user?.studentProfileId || SAMPLE_STUDENTS[0].id;
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);

  // Active student
  const activeStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  // Target role for the active student
  const [targetRoleId, setTargetRoleId] = useState<string>(activeStudent.targetRoleId);

  // Keep targetRoleId in sync when student selection changes
  const handleSelectStudent = (newStudent: StudentProfile) => {
    setSelectedStudentId(newStudent.id);
    setTargetRoleId(newStudent.targetRoleId);
  };

  // Compute ML Predictions and Gap Analysis reactively
  const mlPrediction = useMemo(() => {
    return predictStudentReadiness(activeStudent, targetRoleId);
  }, [activeStudent, targetRoleId]);

  const gapAnalysisResult = useMemo(() => {
    return analyzeSkillGaps(activeStudent, targetRoleId);
  }, [activeStudent, targetRoleId]);

  const recommendations = useMemo(() => {
    return generateCertificationRecommendations(activeStudent, gapAnalysisResult.gaps);
  }, [activeStudent, gapAnalysisResult.gaps]);

  // Live simulation: Update single skill proficiency
  const handleSkillProficiencyChange = (skillId: string, newLevel: number) => {
    setStudents((prev) =>
      prev.map((st) => {
        if (st.id !== activeStudent.id) return st;
        const exists = st.skills.some((s) => s.skillId === skillId);
        let updatedSkills = [];
        if (exists) {
          updatedSkills = st.skills.map((s) =>
            s.skillId === skillId ? { ...s, proficiencyLevel: newLevel } : s
          );
        } else {
          updatedSkills = [
            ...st.skills,
            {
              skillId,
              skillName: skillId,
              proficiencyLevel: newLevel,
              source: 'Self-Taught' as const,
              verified: true,
            },
          ];
        }
        const updated = { ...st, skills: updatedSkills };
        authService.saveStudentProfile(updated);
        return updated;
      })
    );
  };

  // Update whole profile
  const handleSaveStudentProfile = (updated: StudentProfile) => {
    setStudents((prev) => prev.map((st) => (st.id === updated.id ? updated : st)));
    authService.saveStudentProfile(updated);
    if (updated.targetRoleId !== targetRoleId) {
      setTargetRoleId(updated.targetRoleId);
    }
  };

  const handleLoginSuccess = (user: AuthUser, profile: StudentProfile) => {
    setCurrentUser(user);
    setStudents((prev) => {
      const idx = prev.findIndex((s) => s.id === profile.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = profile;
        return copy;
      }
      return [profile, ...prev.filter((s) => s.id !== profile.id)];
    });
    setSelectedStudentId(profile.id);
    setTargetRoleId(profile.targetRoleId);

    // If profile is fresh (no skills or unentered credentials), prompt the user to enter their credentials immediately
    if (profile.skills.length === 0 || profile.gpa === 0) {
      setIsProfileModalOpen(true);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // If unauthenticated, show the Login Page
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Application Header */}
      <Header
        students={students}
        selectedStudent={activeStudent}
        onSelectStudent={handleSelectStudent}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        isPresentationMode={isPresentationMode}
        onTogglePresentationMode={() => setIsPresentationMode((prev) => !prev)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isPresentationMode ? (
          <PresentationView onExitPresentation={() => setIsPresentationMode(false)} />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <StudentDashboard
                student={activeStudent}
                selectedRoleId={targetRoleId}
                onSelectRole={setTargetRoleId}
                prediction={mlPrediction}
                gaps={gapAnalysisResult.gaps}
                acquiredCount={gapAnalysisResult.acquiredSkillsCount}
                criticalMissingCount={gapAnalysisResult.criticalMissingCount}
                radarData={gapAnalysisResult.radarData}
                recommendations={recommendations}
                onSkillProficiencyChange={handleSkillProficiencyChange}
                onOpenAIAdvisor={() => setIsAIModalOpen(true)}
                onNavigateToHistory={() => setActiveTab('readiness_history')}
                onOpenProfileModal={() => setIsProfileModalOpen(true)}
              />
            )}

            {activeTab === 'readiness_history' && (
              <ReadinessHistoryView
                student={activeStudent}
                currentRole={gapAnalysisResult.role}
                currentPrediction={mlPrediction}
                currentGaps={gapAnalysisResult.gaps}
                acquiredCount={gapAnalysisResult.acquiredSkillsCount}
                criticalMissingCount={gapAnalysisResult.criticalMissingCount}
                onNavigateToDashboard={() => setActiveTab('dashboard')}
              />
            )}

            {activeTab === 'analytics' && <AnalyticsView />}

            {activeTab === 'ml_model' && <MLModelView />}

            {activeTab === 'preprocessing' && <PreprocessingView student={activeStudent} />}

            {activeTab === 'certifications' && (
              <CertificationsView
                student={activeStudent}
                gaps={gapAnalysisResult.gaps}
                recommendations={recommendations}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Smart Education & Student Career Analytics Platform
          </span>
          <span className="text-slate-400">
            Powered by Kaggle 1.3M LinkedIn 2024 Dataset • Random Forest & Cosine ML Engine
          </span>
        </div>
      </footer>

      {/* Modals */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        student={activeStudent}
        onSaveStudent={handleSaveStudentProfile}
      />

      <AIAdvisorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        student={activeStudent}
        role={gapAnalysisResult.role}
      />
    </div>
  );
}
