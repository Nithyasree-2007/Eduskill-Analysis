import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Check,
  BookOpen,
  Briefcase,
  Camera,
  Upload,
  User,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  Search,
} from 'lucide-react';
import { ALL_SKILLS, JOB_ROLES } from '../data/industryDataset';
import { ALL_CERTIFICATIONS } from '../data/certificationsData';
import { extractSkillsFromText } from '../services/preprocessing';
import { StudentProfile, StudentSkillProficiency } from '../types';

const AVATAR_PRESETS = [
  { label: 'Scholar 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { label: 'Scholar 2', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' },
  { label: 'Scholar 3', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
  { label: 'Scholar 4', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { label: 'Scholar 5', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
];

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  onSaveStudent: (updated: StudentProfile) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  student,
  onSaveStudent,
}) => {
  const [formData, setFormData] = useState<StudentProfile>({ ...student });
  const [resumeSnippet, setResumeSnippet] = useState<string>('');
  
  // Selected skill and level states
  const [newSkillId, setNewSkillId] = useState<string>(() => {
    // Default to 'react' if available so users can easily configure React, or first skill
    return ALL_SKILLS.some((s) => s.id === 'react') ? 'react' : ALL_SKILLS[0].id;
  });
  const [newSkillLevel, setNewSkillLevel] = useState<number>(1);
  const [skillSearchQuery, setSkillSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [customSkillName, setCustomSkillName] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [lastAddedSkillId, setLastAddedSkillId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData({ ...student });
  }, [student, isOpen]);

  // Dismiss feedback toast after 3 seconds
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => {
        setFeedbackMessage(null);
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          avatarUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoExtract = () => {
    if (!resumeSnippet.trim()) return;
    const extracted = extractSkillsFromText(resumeSnippet);
    const existingIds = new Set(formData.skills.map((s) => s.skillId));

    const newSkills: StudentSkillProficiency[] = [...formData.skills];
    let countAdded = 0;
    extracted.forEach((item) => {
      if (!existingIds.has(item.skillId)) {
        newSkills.push({
          skillId: item.skillId,
          skillName: item.skillName,
          proficiencyLevel: 3,
          source: 'Project',
          verified: true,
        });
        existingIds.add(item.skillId);
        countAdded++;
      }
    });

    setFormData({ ...formData, skills: newSkills });
    setResumeSnippet('');
    setFeedbackMessage(
      countAdded > 0
        ? `Successfully extracted and added ${countAdded} skills from resume!`
        : 'Skills from resume are already in your profile.'
    );
  };

  // Unified handler to add or update any skill with explicit or chosen level
  const handleAddOrUpdateSkill = (targetSkillIdOrName?: string, explicitLevel?: number) => {
    const rawTarget = targetSkillIdOrName || (isCustomMode ? customSkillName.trim() : newSkillId);
    // Explicit level takes first priority; otherwise use selected newSkillLevel (1, 2, 3, 4, or 5)
    const targetLevel = explicitLevel !== undefined ? explicitLevel : newSkillLevel;

    if (!rawTarget) {
      setFeedbackMessage('Please select or enter a skill.');
      return;
    }

    // Try finding in ALL_SKILLS
    const skillObj = ALL_SKILLS.find(
      (s) =>
        s.id === rawTarget ||
        s.name.toLowerCase() === rawTarget.toLowerCase() ||
        (rawTarget.toLowerCase().includes('react') && s.id === 'react')
    );

    const canonicalId = skillObj ? skillObj.id : rawTarget.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const canonicalName = skillObj ? skillObj.name : rawTarget;

    // Check if skill exists in profile (match either by id or name, with special care for react/React.js)
    const existingIdx = formData.skills.findIndex(
      (s) =>
        s.skillId === canonicalId ||
        s.skillName.toLowerCase() === canonicalName.toLowerCase() ||
        (canonicalId === 'react' && (s.skillId === 'react' || s.skillName.toLowerCase().includes('react')))
    );

    if (existingIdx >= 0) {
      const updated = [...formData.skills];
      updated[existingIdx] = {
        ...updated[existingIdx],
        skillId: canonicalId,
        skillName: canonicalName,
        proficiencyLevel: targetLevel,
      };
      setFormData({ ...formData, skills: updated });
      setFeedbackMessage(`✓ Updated "${canonicalName}" to Level ${targetLevel} in your profile!`);
      setLastAddedSkillId(canonicalId);
    } else {
      const newSkill: StudentSkillProficiency = {
        skillId: canonicalId,
        skillName: canonicalName,
        proficiencyLevel: targetLevel,
        source: 'Self-Taught',
        verified: true,
      };
      const updatedSkills = [...formData.skills, newSkill];
      setFormData({
        ...formData,
        skills: updatedSkills,
      });
      setFeedbackMessage(`✓ Added "${canonicalName}" at Level ${targetLevel} to your profile!`);
      setLastAddedSkillId(canonicalId);
    }

    if (isCustomMode) {
      setCustomSkillName('');
    }
  };

  const handleAddSkill = () => {
    handleAddOrUpdateSkill(newSkillId, newSkillLevel);
  };

  const handleDirectQuickAdd = (skillId: string, level?: number) => {
    // Uses provided level or currently selected level
    handleAddOrUpdateSkill(skillId, level !== undefined ? level : newSkillLevel);
  };

  const handleUpdateSkillProficiency = (skillId: string, newLevel: number) => {
    const updatedSkills = formData.skills.map((s) => {
      if (s.skillId === skillId || (skillId === 'react' && (s.skillId === 'react' || s.skillName.toLowerCase().includes('react')))) {
        return { ...s, proficiencyLevel: newLevel };
      }
      return s;
    });

    setFormData({
      ...formData,
      skills: updatedSkills,
    });
    setLastAddedSkillId(skillId);
    const match = updatedSkills.find(
      (s) => s.skillId === skillId || (skillId === 'react' && s.skillName.toLowerCase().includes('react'))
    );
    setFeedbackMessage(`✓ Updated "${match?.skillName || skillId}" to Level ${newLevel}!`);
  };

  const handleRemoveSkill = (skillId: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(
        (s) => s.skillId !== skillId && !(skillId === 'react' && s.skillName.toLowerCase().includes('react'))
      ),
    });
  };

  const handleToggleCert = (certId: string) => {
    const hasCert = formData.completedCertifications.includes(certId);
    setFormData({
      ...formData,
      completedCertifications: hasCert
        ? formData.completedCertifications.filter((id) => id !== certId)
        : [...formData.completedCertifications, certId],
    });
  };

  const handleResetToClean = () => {
    setFormData((prev) => ({
      ...prev,
      university: '',
      degree: '',
      year: 1,
      gpa: 0,
      skills: [],
      courses: [],
      projects: [],
      completedCertifications: [],
      bio: '',
    }));
    setFeedbackMessage('Profile reset to clean state! You can now enter your own credentials.');
  };

  const handleSave = () => {
    onSaveStudent(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Edit Student Profile & Verified Skills
            </h3>
            <p className="text-xs text-slate-500">
              Update academic credentials, declared skills, and accredited certifications.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Profile Photo & Identity Card */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative group">
                {formData.avatarUrl ? (
                  <img
                    src={formData.avatarUrl}
                    alt={formData.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-indigo-600 shadow-xs"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold border-2 border-indigo-500 shadow-xs">
                    {formData.avatarInitials || formData.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 bg-white text-indigo-600 rounded-full border border-slate-200 shadow-xs hover:bg-indigo-50 transition-colors"
                  title="Upload profile photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{formData.name}</h4>
                  <span className="text-[10px] px-2 py-0.5 font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md">
                    Candidate Profile
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{formData.email}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {formData.university} • {formData.degree}
                </p>
              </div>
            </div>

            {/* Avatar Presets */}
            <div className="flex flex-col items-center sm:items-end gap-1.5">
              <span className="text-[11px] font-semibold text-slate-600">Choose Avatar / Preset:</span>
              <div className="flex items-center gap-1.5">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarUrl: preset.url })}
                    className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all ${
                      formData.avatarUrl === preset.url
                        ? 'border-indigo-600 scale-110 shadow-xs'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                    title={preset.label}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, avatarUrl: undefined })}
                  className={`w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center border transition-all ${
                    !formData.avatarUrl
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                  title="Use Initials"
                >
                  {formData.avatarInitials || formData.name.slice(0, 2).toUpperCase()}
                </button>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 mt-0.5 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>Upload Custom Photo</span>
              </button>
            </div>
          </div>

          {/* General Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="input-full-name" className="font-semibold text-slate-700 block mb-1">Full Name</label>
              <input
                id="input-full-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label htmlFor="input-university" className="font-semibold text-slate-700 block mb-1">University / Institute</label>
              <input
                id="input-university"
                type="text"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                placeholder="Enter college / university (e.g. Bannari Amman Institute of Technology)"
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label htmlFor="input-degree-program" className="font-semibold text-slate-700 block mb-1">Degree Program</label>
              <input
                id="input-degree-program"
                type="text"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                placeholder="e.g. B.Tech Information Technology"
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label htmlFor="select-target-role" className="font-semibold text-slate-700 block mb-1">Target Career Role</label>
              <select
                id="select-target-role"
                value={formData.targetRoleId}
                onChange={(e) => setFormData({ ...formData, targetRoleId: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-hidden font-medium text-slate-800"
              >
                {JOB_ROLES.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.title} ({role.domain})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="select-academic-year" className="font-semibold text-slate-700 block mb-1">Academic Year</label>
                <select
                  id="select-academic-year"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-hidden"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>
              <div>
                <label htmlFor="input-cgpa" className="font-semibold text-slate-700 block mb-1">CGPA (out of 10)</label>
                <input
                  id="input-cgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.gpa > 0 ? formData.gpa : ''}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value === '' ? 0 : Math.min(10, Math.max(0, Number(e.target.value))) })}
                  placeholder="e.g. 8.50"
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
            <div>
              <label htmlFor="input-email" className="font-semibold text-slate-700 block mb-1">Institutional Email</label>
              <input
                id="input-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Quick NLP Resume Skills Ingestion */}
          <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Quick Resume / Project Text Ingestion
              </span>
              <span className="text-[10px] text-indigo-700">Auto-Extracts Skills</span>
            </div>
            <textarea
              aria-label="Quick resume text ingestion"
              rows={2}
              value={resumeSnippet}
              onChange={(e) => setResumeSnippet(e.target.value)}
              placeholder="Paste bio, projects, or resume bullets (e.g., 'Built FastAPI service with Docker, PyTorch and AWS...')"
              className="w-full p-2 text-xs bg-white border border-indigo-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAutoExtract}
                disabled={!resumeSnippet.trim()}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg disabled:opacity-40 transition-colors text-[11px]"
              >
                Extract Skills Into Profile
              </button>
            </div>
          </div>

          {/* Add Skill Control & Proficiencies */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="font-bold text-slate-800 text-sm">
                Acquired Skill Proficiencies ({formData.skills.length}):
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    !isCustomMode
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Browse Catalog
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(true)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    isCustomMode
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  + Type Custom Skill
                </button>
              </div>
            </div>

            {/* Notification Toast */}
            {feedbackMessage && (
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg shadow-2xs transition-all animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{feedbackMessage}</span>
              </div>
            )}

            {/* Interactive Skill Selection & Level Picker Box */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              {!isCustomMode ? (
                <>
                  {/* Category Pills & Search */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Filter skills (e.g., React, Python, AWS, Docker)..."
                          value={skillSearchQuery}
                          onChange={(e) => setSkillSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      {skillSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setSkillSearchQuery('')}
                          className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded bg-slate-200/70"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Category Filter Chips */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                      {[
                        'All',
                        'Frameworks & Web',
                        'Languages',
                        'AI / ML & Data Science',
                        'Cloud & DevOps',
                        'Databases & Big Data',
                      ].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-2 py-0.5 rounded-full whitespace-nowrap font-medium transition-colors cursor-pointer ${
                            selectedCategory === cat
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-300 font-semibold'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Clickable Skill Chips (Click to select) */}
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-white rounded-lg border border-slate-200">
                      {(() => {
                        const filtered = ALL_SKILLS.filter((sk) => {
                          const matchesCat =
                            selectedCategory === 'All' || sk.category === selectedCategory;
                          const matchesQuery =
                            !skillSearchQuery ||
                            sk.name.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
                            sk.category.toLowerCase().includes(skillSearchQuery.toLowerCase());
                          return matchesCat && matchesQuery;
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="w-full text-center py-2 text-xs text-slate-400">
                              No catalog skills match "{skillSearchQuery}". You can add it as a custom skill below!
                            </div>
                          );
                        }

                        return filtered.map((sk) => {
                          const isSelected = newSkillId === sk.id;
                          const profileMatch = formData.skills.find(
                            (s) =>
                              s.skillId === sk.id ||
                              (sk.id === 'react' &&
                                (s.skillId === 'react' || s.skillName.toLowerCase().includes('react')))
                          );

                          return (
                            <button
                              key={sk.id}
                              type="button"
                              id={`chip-skill-${sk.id}`}
                              onClick={() => {
                                setNewSkillId(sk.id);
                                // If already in profile, optionally hint or keep level
                              }}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer border ${
                                isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-300 font-bold'
                                  : profileMatch
                                  ? 'bg-indigo-50/70 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <span>{sk.name}</span>
                              {profileMatch && (
                                <span
                                  className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                                    isSelected
                                      ? 'bg-white/20 text-white'
                                      : 'bg-indigo-200/80 text-indigo-900'
                                  }`}
                                >
                                  L{profileMatch.proficiencyLevel}
                                </span>
                              )}
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </>
              ) : (
                /* Custom Skill Input */
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Type custom skill name:</label>
                  <input
                    type="text"
                    placeholder="e.g. Next.js, FastAPI, GraphQL, Kubernetes..."
                    value={customSkillName}
                    onChange={(e) => setCustomSkillName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white font-medium text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {/* Active Selection Banner */}
              {(() => {
                const activeSkillObj = ALL_SKILLS.find((s) => s.id === newSkillId);
                const activeName = isCustomMode
                  ? customSkillName || '(Enter skill name)'
                  : activeSkillObj?.name || newSkillId;
                const profileMatch = formData.skills.find(
                  (s) =>
                    s.skillId === newSkillId ||
                    s.skillName.toLowerCase() === activeName.toLowerCase() ||
                    (newSkillId === 'react' &&
                      (s.skillId === 'react' || s.skillName.toLowerCase().includes('react')))
                );

                return (
                  <div className="bg-white p-2.5 rounded-lg border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Selected Skill: </span>
                      <strong className="text-indigo-900 text-sm">{activeName}</strong>
                      {profileMatch && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          Current in Profile: Level {profileMatch.proficiencyLevel}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Target Level to apply: <strong className="text-indigo-600 font-bold">Level {newSkillLevel}</strong>
                    </div>
                  </div>
                );
              })()}

              {/* 5-Level Clickable Selection Buttons (Click Level 1 to 5 directly) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Select Proficiency Level:</span>
                  <span className="text-[11px] text-indigo-600 font-medium">
                    Level {newSkillLevel} of 5 selected
                  </span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { lvl: 1, title: 'L1: Novice', desc: 'Basic fundamentals' },
                    { lvl: 2, title: 'L2: Basic', desc: 'Working knowledge' },
                    { lvl: 3, title: 'L3: Competent', desc: 'Independent coder' },
                    { lvl: 4, title: 'L4: Proficient', desc: 'Production-ready' },
                    { lvl: 5, title: 'L5: Expert', desc: 'Deep mastery' },
                  ].map(({ lvl, title, desc }) => {
                    const isSelected = newSkillLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        id={`btn-skill-level-${lvl}`}
                        onClick={() => setNewSkillLevel(lvl)}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-pointer text-center ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-300 font-bold'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                        title={`${title}: ${desc}`}
                      >
                        <span className="text-xs font-bold leading-tight">
                          {isSelected ? `✓ L${lvl}` : `L${lvl}`}
                        </span>
                        <span className={`text-[10px] hidden sm:inline ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {title.split(': ')[1]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Add/Update Action Button */}
              {(() => {
                const activeSkillObj = ALL_SKILLS.find((s) => s.id === newSkillId);
                const activeName = isCustomMode
                  ? customSkillName.trim()
                  : activeSkillObj?.name || newSkillId;
                const isExisting = formData.skills.some(
                  (s) =>
                    s.skillId === newSkillId ||
                    s.skillName.toLowerCase() === activeName.toLowerCase() ||
                    (newSkillId === 'react' &&
                      (s.skillId === 'react' || s.skillName.toLowerCase().includes('react')))
                );

                return (
                  <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                    <button
                      type="button"
                      id="btn-add-profile-skill"
                      onClick={handleAddSkill}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                        isExisting
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white ring-2 ring-indigo-300'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                      title={
                        isExisting
                          ? `Update ${activeName || 'skill'} to Level ${newSkillLevel}`
                          : `Add ${activeName || 'skill'} at Level ${newSkillLevel}`
                      }
                    >
                      {isExisting ? (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          <span>Update {activeName || 'Skill'} to Level {newSkillLevel}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>+ Add {activeName || 'Skill'} at Level {newSkillLevel}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Current Skills Badges with 1-Click Level Buttons on Every Badge */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold">Current Profile Skills:</span>
                <span className="text-[11px] text-slate-400">
                  Tip: Click [1] to [5] on any skill badge below to instantly adjust its level
                </span>
              </div>
              <div className="border border-slate-200 rounded-xl p-2.5 bg-white max-h-52 overflow-y-auto">
                {formData.skills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">
                    No skills in profile yet. Click any skill chip above and choose a level to add it.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 p-1">
                    {formData.skills.map((sk) => {
                      const isRecentlyModified =
                        lastAddedSkillId === sk.skillId ||
                        (lastAddedSkillId === 'react' &&
                          (sk.skillId === 'react' || sk.skillName.toLowerCase().includes('react')));

                      return (
                        <div
                          key={sk.skillId}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                            isRecentlyModified
                              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400 text-emerald-950 font-semibold shadow-xs scale-[1.01]'
                              : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <span className="font-semibold">{sk.skillName}</span>

                          {/* 1-Click Level Switcher Buttons directly on badge */}
                          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded border border-slate-200">
                            {[1, 2, 3, 4, 5].map((lvl) => {
                              const isLvlActive = sk.proficiencyLevel === lvl;
                              return (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => handleUpdateSkillProficiency(sk.skillId, lvl)}
                                  className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center transition-colors cursor-pointer ${
                                    isLvlActive
                                      ? 'bg-indigo-600 text-white'
                                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                  }`}
                                  title={`Set ${sk.skillName} to Level ${lvl}`}
                                >
                                  {lvl}
                                </button>
                              );
                            })}
                          </div>

                          {/* Remove Skill Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(sk.skillId)}
                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded transition-colors cursor-pointer"
                            title={`Remove ${sk.skillName} from profile`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Completed Certifications Checklist */}
          <div>
            <span className="font-bold text-slate-800 block mb-2">Completed Certifications:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
              {ALL_CERTIFICATIONS.slice(0, 10).map((cert) => {
                const isChecked = formData.completedCertifications.includes(cert.id);
                return (
                  <label
                    key={cert.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleCert(cert.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="truncate">{cert.title}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleResetToClean}
            className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors inline-flex items-center gap-1.5 border border-rose-200 cursor-pointer"
            title="Clear all fields, skills, and academic records to start completely fresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Blank Profile</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save & Update Prediction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
