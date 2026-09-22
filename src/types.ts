export type SkillCategory =
  | 'Languages'
  | 'Frameworks & Web'
  | 'Cloud & DevOps'
  | 'AI / ML & Data Science'
  | 'Databases & Big Data'
  | 'Security & Systems'
  | 'Core Software Engineering';

export type ReadinessTier = 'Novice' | 'Developing' | 'Job Competent' | 'Industry Ready';

export interface SkillItem {
  id: string;
  name: string;
  category: SkillCategory;
  marketFrequency: number; // count in 1.3M LinkedIn jobs
  importanceWeight: number; // 1 to 5
  medianSalaryUsd: number;
  trendingGrowth: number; // e.g. +24% YoY
  description: string;
}

export interface RoleSkillRequirement {
  skillId: string;
  skillName: string;
  category: SkillCategory;
  requiredLevel: number; // 1 to 5
  isCritical: boolean;
  marketWeight: number; // 0 to 1
}

export interface JobRole {
  id: string;
  title: string;
  domain: string;
  shortDescription: string;
  totalJobPostings: number; // in 1.3M dataset
  avgAnnualSalaryUsd: number;
  avgAnnualSalaryInrLpa: number;
  experienceLevel: 'Entry-Level' | 'Mid-Level' | 'Senior';
  skills: RoleSkillRequirement[];
  topHiringCompanies: string[];
}

export interface StudentCourse {
  courseName: string;
  grade: string;
  semester: string;
  associatedSkills: string[];
}

export interface StudentProject {
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  complexity: 'Basic' | 'Intermediate' | 'Advanced';
}

export interface StudentSkillProficiency {
  skillId: string;
  skillName: string;
  proficiencyLevel: number; // 1 to 5
  source: 'Course' | 'Project' | 'Certification' | 'Self-Taught' | 'Workshop';
  verified: boolean;
}

export interface StudentProfile {
  id: string;
  name: string;
  university: string;
  degree: string;
  year: number; // 2, 3, 4
  gpa: number;
  email: string;
  targetRoleId: string;
  skills: StudentSkillProficiency[];
  courses: StudentCourse[];
  projects: StudentProject[];
  completedCertifications: string[]; // certification IDs
  bio?: string;
  avatarUrl?: string;
  avatarInitials?: string;
}

export interface Certification {
  id: string;
  title: string;
  provider: string; // e.g., 'AWS', 'Google Cloud', 'DeepLearning.AI', 'Meta'
  platform: string; // e.g., 'Coursera', 'Official Exam', 'edX'
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  durationWeeks: number;
  costUsd: number;
  isFreeOrFinancialAid: boolean;
  skillsCovered: string[];
  careerOutcome: string;
  examCode?: string;
  industryDemandScore: number; // 0 to 100
  externalUrl: string;
}

export interface SkillGapItem {
  skillId: string;
  skillName: string;
  category: SkillCategory;
  requiredLevel: number;
  currentLevel: number;
  gapDelta: number; // requiredLevel - currentLevel
  isCritical: boolean;
  priorityScore: number; // 0 to 100
  marketDemand: number;
  urgency: 'Critical' | 'Medium' | 'Low';
}

export interface MLPredictionResult {
  readinessScore: number; // 0 to 100
  readinessTier: ReadinessTier;
  confidenceScore: number; // 0 to 1
  cosineSimilarity: number;
  criticalSkillCoverage: number; // percentage 0 to 100
  projectAlignmentScore: number; // 0 to 100
  certificationBoost: number; // added score
  estimatedWeeksToReady: number;
  features: {
    skillMatchRatio: number;
    experienceDepth: number;
    courseworkScore: number;
    certFactor: number;
  };
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  rmse: number;
  datasetSize: number;
  trainingSamples: number;
  testSamples: number;
  featureImportances: { feature: string; weight: number }[];
  confusionMatrix: {
    labels: ReadinessTier[];
    matrix: number[][];
  };
}

export interface CertificationRecommendation {
  certification: Certification;
  matchScore: number; // 0 to 100
  targetedGaps: string[];
  expectedReadinessUplift: number; // e.g., +15%
  priorityRank: number;
  reasoning: string;
}

export interface LearningMilestone {
  weekRange: string;
  phaseTitle: string;
  focusSkills: string[];
  recommendedAction: string;
  targetCertification?: string;
}

export interface ReadinessScoreSnapshot {
  id: string;
  studentId: string;
  timestamp: string; // ISO 8601
  displayDate: string; // e.g. "Aug 15, 2026 • 2:30 PM"
  roleId: string;
  roleTitle: string;
  readinessScore: number; // 0 to 100
  readinessTier: ReadinessTier;
  confidenceScore: number; // 0 to 1
  criticalSkillCoverage: number; // percentage
  acquiredSkillsCount: number;
  criticalMissingCount: number;
  topGaps: string[];
  note?: string;
  trigger: 'automatic' | 'manual' | 'milestone';
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'placement_officer';
  institution: string;
  studentProfileId?: string; // links to StudentProfile.id if student
  avatarInitials?: string;
}
