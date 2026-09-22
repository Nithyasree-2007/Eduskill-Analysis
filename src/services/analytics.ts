import { ALL_SKILLS, JOB_ROLES } from '../data/industryDataset';
import { SAMPLE_STUDENTS } from '../data/studentDataset';
import { SkillCategory } from '../types';

export interface SkillDemandSupplyStat {
  skillId: string;
  skillName: string;
  category: SkillCategory;
  marketDemandPostings: number;
  marketDemandPct: number; // % of 1.3M jobs
  studentSupplyPct: number; // % of students who have acquired this
  gapIndex: number; // marketDemandPct - studentSupplyPct (Positive = Deficit/Shortage, Negative = High Supply)
  status: 'Critical Shortage' | 'Moderate Gap' | 'Equilibrium' | 'High Supply';
  avgSalaryUsd: number;
}

export interface CategoryDistribution {
  category: SkillCategory;
  totalMarketPostings: number;
  avgSalary: number;
  skillCount: number;
}

export function computeCategoryDistributions(): CategoryDistribution[] {
  const categoryMap: Record<SkillCategory, { postings: number; totalSalary: number; count: number }> = {
    'Languages': { postings: 0, totalSalary: 0, count: 0 },
    'Frameworks & Web': { postings: 0, totalSalary: 0, count: 0 },
    'Cloud & DevOps': { postings: 0, totalSalary: 0, count: 0 },
    'AI / ML & Data Science': { postings: 0, totalSalary: 0, count: 0 },
    'Databases & Big Data': { postings: 0, totalSalary: 0, count: 0 },
    'Security & Systems': { postings: 0, totalSalary: 0, count: 0 },
    'Core Software Engineering': { postings: 0, totalSalary: 0, count: 0 },
  };

  ALL_SKILLS.forEach((skill) => {
    if (categoryMap[skill.category]) {
      categoryMap[skill.category].postings += skill.marketFrequency;
      categoryMap[skill.category].totalSalary += skill.medianSalaryUsd;
      categoryMap[skill.category].count += 1;
    }
  });

  return Object.entries(categoryMap).map(([cat, data]) => ({
    category: cat as SkillCategory,
    totalMarketPostings: data.postings,
    avgSalary: Math.round(data.totalSalary / Math.max(1, data.count)),
    skillCount: data.count,
  }));
}

export function computeDemandSupplyGaps(): SkillDemandSupplyStat[] {
  const totalPostingsBase = 1300000;
  const totalStudents = SAMPLE_STUDENTS.length;

  return ALL_SKILLS.map((skill) => {
    const marketDemandPct = Number(((skill.marketFrequency / totalPostingsBase) * 100).toFixed(1));

    // Calculate how many students in the sample cohort possess this skill (at level >= 3)
    const studentsWithSkill = SAMPLE_STUDENTS.filter((st) =>
      st.skills.some((s) => s.skillId === skill.id && s.proficiencyLevel >= 3)
    ).length;

    const studentSupplyPct = Number(((studentsWithSkill / totalStudents) * 100).toFixed(1));
    const gapIndex = Number((marketDemandPct - studentSupplyPct).toFixed(1));

    let status: 'Critical Shortage' | 'Moderate Gap' | 'Equilibrium' | 'High Supply' = 'Equilibrium';
    if (gapIndex > 15) status = 'Critical Shortage';
    else if (gapIndex > 5) status = 'Moderate Gap';
    else if (gapIndex < -15) status = 'High Supply';

    return {
      skillId: skill.id,
      skillName: skill.name,
      category: skill.category,
      marketDemandPostings: skill.marketFrequency,
      marketDemandPct,
      studentSupplyPct,
      gapIndex,
      status,
      avgSalaryUsd: skill.medianSalaryUsd,
    };
  }).sort((a, b) => b.gapIndex - a.gapIndex);
}

export function getTopDemandedSkills(limit = 12) {
  return [...ALL_SKILLS]
    .sort((a, b) => b.marketFrequency - a.marketFrequency)
    .slice(0, limit)
    .map((s) => ({
      name: s.name,
      postings: s.marketFrequency,
      formattedPostings: `${Math.round(s.marketFrequency / 1000)}k`,
      category: s.category,
      growth: s.trendingGrowth,
      salary: `$${Math.round(s.medianSalaryUsd / 1000)}k`,
    }));
}

export function getRoleMarketStats() {
  return JOB_ROLES.map((r) => ({
    id: r.id,
    title: r.title,
    domain: r.domain,
    postings: r.totalJobPostings,
    salaryUsd: r.avgAnnualSalaryUsd,
    salaryInr: `${r.avgAnnualSalaryInrLpa} LPA`,
    criticalSkillCount: r.skills.filter((s) => s.isCritical).length,
  }));
}
