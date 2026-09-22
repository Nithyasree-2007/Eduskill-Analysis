import { ReadinessScoreSnapshot, ReadinessTier } from '../types';

const STORAGE_PREFIX = 'skill_readiness_history_';

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Generate realistic baseline progression history if the student has no stored history yet
function generateDefaultHistory(studentId: string): ReadinessScoreSnapshot[] {
  const now = new Date();

  // Historical milestones offset in time
  const historyTemplates: Record<string, Array<{ daysAgo: number; score: number; tier: ReadinessTier; roleId: string; roleTitle: string; note: string; topGaps: string[] }>> = {
    'stu_001': [
      {
        daysAgo: 120,
        score: 44,
        tier: 'Developing',
        roleId: 'role_fullstack',
        roleTitle: 'Full Stack Web Developer',
        note: 'Semester 3 Baseline: Completed Web Tech fundamentals & JavaScript core.',
        topGaps: ['Docker', 'Kubernetes', 'TypeScript', 'Node.js', 'System Design'],
      },
      {
        daysAgo: 75,
        score: 58,
        tier: 'Developing',
        roleId: 'role_fullstack',
        roleTitle: 'Full Stack Web Developer',
        note: 'Mid-term Assessment: Built full-stack MongoDB + Express project.',
        topGaps: ['Docker', 'Kubernetes', 'CI/CD Pipelines', 'AWS / Cloud Deployment'],
      },
      {
        daysAgo: 30,
        score: 67,
        tier: 'Job Competent',
        roleId: 'role_fullstack',
        roleTitle: 'Full Stack Web Developer',
        note: 'Project Evaluation: Added React 18, Tailwind, and Node.js REST API.',
        topGaps: ['Docker', 'Kubernetes', 'Cloud Infrastructure'],
      },
      {
        daysAgo: 5,
        score: 72,
        tier: 'Job Competent',
        roleId: 'role_fullstack',
        roleTitle: 'Full Stack Web Developer',
        note: 'Pre-Campus Placement Readiness Check: Initiated Docker containerization.',
        topGaps: ['Kubernetes', 'AWS ECS', 'System Design'],
      },
    ],
    'stu_002': [
      {
        daysAgo: 140,
        score: 38,
        tier: 'Novice',
        roleId: 'role_ml_engineer',
        roleTitle: 'AI & Machine Learning Engineer',
        note: 'Semester 4 Diagnostic: Basic Python and linear algebra background.',
        topGaps: ['PyTorch', 'MLOps', 'Docker', 'Transformer Models', 'Model Serving'],
      },
      {
        daysAgo: 80,
        score: 52,
        tier: 'Developing',
        roleId: 'role_ml_engineer',
        roleTitle: 'AI & Machine Learning Engineer',
        note: 'Course Milestone: Completed Scikit-learn algorithms and EDA coursework.',
        topGaps: ['MLOps (MLflow)', 'Deep Learning (PyTorch)', 'Docker / Kubernetes for AI'],
      },
      {
        daysAgo: 20,
        score: 65,
        tier: 'Job Competent',
        roleId: 'role_ml_engineer',
        roleTitle: 'AI & Machine Learning Engineer',
        note: 'Deep Learning Capstone: Trained CNN classification models in PyTorch.',
        topGaps: ['MLOps (MLflow, Triton)', 'Kubernetes Cluster Deployment'],
      },
    ],
    'stu_003': [
      {
        daysAgo: 100,
        score: 41,
        tier: 'Developing',
        roleId: 'role_cloud_devops',
        roleTitle: 'Cloud & DevOps Engineer',
        note: 'Initial Assessment: Linux basics and shell scripting.',
        topGaps: ['AWS Architecture', 'Terraform', 'Kubernetes', 'CI/CD Pipelines'],
      },
      {
        daysAgo: 45,
        score: 61,
        tier: 'Job Competent',
        roleId: 'role_cloud_devops',
        roleTitle: 'Cloud & DevOps Engineer',
        note: 'AWS Certification prep: Passed AWS Certified Cloud Practitioner.',
        topGaps: ['Kubernetes (EKS)', 'Terraform IaC', 'ArgoCD'],
      },
    ],
  };

  const templates = historyTemplates[studentId] || [
    {
      daysAgo: 90,
      score: 45,
      tier: 'Developing' as ReadinessTier,
      roleId: 'role_fullstack',
      roleTitle: 'Software Engineer',
      note: 'Baseline Academic Evaluation',
      topGaps: ['Cloud Architecture', 'Docker Containerization', 'Automated Testing'],
    },
    {
      daysAgo: 30,
      score: 62,
      tier: 'Job Competent' as ReadinessTier,
      roleId: 'role_fullstack',
      roleTitle: 'Software Engineer',
      note: 'Mid-term Review after practical lab completion',
      topGaps: ['DevOps & CI/CD', 'Microservices Design'],
    },
  ];

  return templates.map((t, idx) => {
    const d = new Date(now.getTime() - t.daysAgo * 24 * 60 * 60 * 1000);
    return {
      id: `seed_${studentId}_${idx}_${d.getTime()}`,
      studentId,
      timestamp: d.toISOString(),
      displayDate: formatDisplayDate(d),
      roleId: t.roleId,
      roleTitle: t.roleTitle,
      readinessScore: t.score,
      readinessTier: t.tier,
      confidenceScore: 0.88,
      criticalSkillCoverage: Math.min(100, Math.round(t.score * 1.15)),
      acquiredSkillsCount: Math.round(t.score / 12) + 2,
      criticalMissingCount: Math.max(1, 5 - Math.round(t.score / 20)),
      topGaps: t.topGaps,
      note: t.note,
      trigger: 'milestone',
    };
  });
}

export const historyStorageService = {
  getStudentHistory(studentId: string): ReadinessScoreSnapshot[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${studentId}`);
      if (!raw) {
        // Initialize with default seeds and persist
        const defaults = generateDefaultHistory(studentId);
        localStorage.setItem(`${STORAGE_PREFIX}${studentId}`, JSON.stringify(defaults));
        return defaults;
      }
      const parsed: ReadinessScoreSnapshot[] = JSON.parse(raw);
      // Sort chronologically ascending
      return parsed.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    } catch (err) {
      console.error('Failed to read readiness history from localStorage:', err);
      return generateDefaultHistory(studentId);
    }
  },

  saveSnapshot(
    snapshot: Omit<ReadinessScoreSnapshot, 'id' | 'timestamp' | 'displayDate'> & {
      timestamp?: string;
      displayDate?: string;
      id?: string;
    }
  ): ReadinessScoreSnapshot {
    const current = this.getStudentHistory(snapshot.studentId);
    const dateObj = snapshot.timestamp ? new Date(snapshot.timestamp) : new Date();
    const newSnapshot: ReadinessScoreSnapshot = {
      ...snapshot,
      id: snapshot.id || `snap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: dateObj.toISOString(),
      displayDate: snapshot.displayDate || formatDisplayDate(dateObj),
      trigger: snapshot.trigger || 'manual',
    };

    const updated = [...current, newSnapshot].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    try {
      localStorage.setItem(`${STORAGE_PREFIX}${snapshot.studentId}`, JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent('readiness-history-updated', {
          detail: { studentId: snapshot.studentId, snapshot: newSnapshot },
        })
      );
    } catch (err) {
      console.error('Failed to persist snapshot in localStorage:', err);
    }

    return newSnapshot;
  },

  deleteSnapshot(studentId: string, snapshotId: string): ReadinessScoreSnapshot[] {
    const current = this.getStudentHistory(studentId);
    const filtered = current.filter((s) => s.id !== snapshotId);
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${studentId}`, JSON.stringify(filtered));
      window.dispatchEvent(
        new CustomEvent('readiness-history-updated', { detail: { studentId } })
      );
    } catch (err) {
      console.error('Failed to delete snapshot from localStorage:', err);
    }
    return filtered;
  },

  clearStudentHistory(studentId: string): void {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${studentId}`, JSON.stringify([]));
      window.dispatchEvent(
        new CustomEvent('readiness-history-updated', { detail: { studentId } })
      );
    } catch (err) {
      console.error('Failed to clear history from localStorage:', err);
    }
  },

  resetToDefaultHistory(studentId: string): ReadinessScoreSnapshot[] {
    const defaults = generateDefaultHistory(studentId);
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${studentId}`, JSON.stringify(defaults));
      window.dispatchEvent(
        new CustomEvent('readiness-history-updated', { detail: { studentId } })
      );
    } catch (err) {
      console.error('Failed to reset history in localStorage:', err);
    }
    return defaults;
  },

  exportHistoryJson(studentId: string): string {
    const history = this.getStudentHistory(studentId);
    return JSON.stringify(history, null, 2);
  },
};
