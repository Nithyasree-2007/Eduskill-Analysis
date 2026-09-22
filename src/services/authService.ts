import { AuthUser, StudentProfile } from '../types';

const AUTH_STORAGE_KEY = 'eduskill_auth_session';
const USER_PROFILE_PREFIX = 'eduskill_profile_';

// Default initial skills constant kept for reference, but NOT auto-assigned to new users
export const DEFAULT_INITIAL_SKILLS = [
  { skillId: 'python', skillName: 'Python', proficiencyLevel: 4, source: 'Course' as const, verified: true },
  { skillId: 'javascript', skillName: 'JavaScript (ES6+)', proficiencyLevel: 3, source: 'Project' as const, verified: true },
  { skillId: 'react', skillName: 'React.js', proficiencyLevel: 3, source: 'Project' as const, verified: true },
  { skillId: 'sql', skillName: 'SQL (PostgreSQL / MySQL)', proficiencyLevel: 3, source: 'Course' as const, verified: true },
  { skillId: 'git', skillName: 'Git & GitHub', proficiencyLevel: 4, source: 'Project' as const, verified: true },
  { skillId: 'dsa', skillName: 'Data Structures & Algorithms', proficiencyLevel: 3, source: 'Course' as const, verified: true },
  { skillId: 'docker', skillName: 'Docker Containerization', proficiencyLevel: 2, source: 'Self-Taught' as const, verified: false },
];

export const authService = {
  getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  getStudentProfile(userId: string): StudentProfile | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(`${USER_PROFILE_PREFIX}${userId}`);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  saveStudentProfile(profile: StudentProfile): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${USER_PROFILE_PREFIX}${profile.id}`, JSON.stringify(profile));
      window.dispatchEvent(
        new CustomEvent('student-profile-updated', { detail: { profile } })
      );
    } catch (err) {
      console.error('Failed to save student profile to localStorage:', err);
    }
  },

  resetProfileToEmpty(userId: string): StudentProfile | null {
    const existing = this.getStudentProfile(userId);
    if (!existing) return null;
    const cleanProfile: StudentProfile = {
      ...existing,
      university: '',
      degree: '',
      year: 1,
      gpa: 0,
      bio: '',
      skills: [],
      courses: [],
      projects: [],
      completedCertifications: [],
    };
    this.saveStudentProfile(cleanProfile);
    return cleanProfile;
  },

  login(params: {
    fullName?: string;
    email: string;
    institution?: string;
    degree?: string;
    role?: 'student' | 'faculty' | 'placement_officer';
  }): { success: boolean; user: AuthUser; profile: StudentProfile } {
    const cleanEmail = (params.email || '').trim().toLowerCase();
    
    // Derive name from input or email if empty
    let displayName = (params.fullName || '').trim();
    if (!displayName) {
      const emailUserPart = cleanEmail.split('@')[0] || 'student';
      // Format "vinutha.r" -> "Vinutha R"
      displayName = emailUserPart
        .replace(/[0-9_.]+/g, ' ')
        .trim()
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      if (!displayName) displayName = 'Student User';
    }

    const institution = (params.institution || '').trim();
    const degree = (params.degree || '').trim();
    const initials = displayName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'ST';

    const userId = `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

    const user: AuthUser = {
      id: userId,
      name: displayName,
      email: cleanEmail,
      role: params.role || 'student',
      institution: institution || 'Institutional Portal',
      studentProfileId: userId,
      avatarInitials: initials,
    };

    // Check if profile already exists in localStorage
    let profile = this.getStudentProfile(userId);
    if (!profile) {
      // Create fresh blank profile - ONLY name and email are populated; no pre-filled fake CGPA or skills!
      profile = {
        id: userId,
        name: displayName,
        email: cleanEmail,
        university: institution,
        degree: degree,
        year: 1,
        gpa: 0,
        targetRoleId: 'role_ai_ml_engineer',
        bio: '',
        skills: [], // Fresh profile has 0 skills - user enters their own skills
        courses: [],
        projects: [],
        completedCertifications: [],
        avatarInitials: initials,
      };
      this.saveStudentProfile(profile);
    } else {
      // Check if this existing profile was populated by the legacy template with dummy 8.65 GPA and 7 pre-filled skills
      const hasLegacyDummyData =
        profile.gpa === 8.65 &&
        profile.skills.length === 7 &&
        profile.skills.some((s) => s.skillId === 'python' && s.proficiencyLevel === 4);

      if (hasLegacyDummyData) {
        // Clear out the dummy data so the user gets the clean profile they requested
        profile.gpa = 0;
        profile.skills = [];
        profile.courses = [];
        profile.projects = [];
        profile.bio = '';
        if (profile.university === 'Bannari Amman Institute of Technology' && !institution) {
          profile.university = '';
        }
        if (profile.degree === 'B.Tech Information Technology' && !degree) {
          profile.degree = '';
        }
      }

      // Update name and email to match latest login
      profile.name = displayName;
      if (institution) profile.university = institution;
      if (degree) profile.degree = degree;
      profile.email = cleanEmail;
      profile.avatarInitials = initials;
      this.saveStudentProfile(profile);
    }

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { user } }));
    } catch (err) {
      console.error('Failed to save session:', err);
    }

    return { success: true, user, profile };
  },

  logout(): void {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { user: null } }));
    } catch (err) {
      console.error('Failed to clear session:', err);
    }
  },
};
