import { JOB_ROLES } from '../data/industryDataset';
import { JobRole, SkillGapItem, StudentProfile } from '../types';

export function analyzeSkillGaps(student: StudentProfile, targetRoleId?: string): {
  role: JobRole;
  gaps: SkillGapItem[];
  acquiredSkillsCount: number;
  criticalMissingCount: number;
  overallGapIndex: number;
  radarData: { skill: string; student: number; industry: number; fullMark: number }[];
} {
  const roleId = targetRoleId || student.targetRoleId;
  const role = JOB_ROLES.find((r) => r.id === roleId) || JOB_ROLES[0];

  const gaps: SkillGapItem[] = [];
  let totalDelta = 0;
  let totalRequired = 0;
  let acquiredCount = 0;
  let criticalMissingCount = 0;

  role.skills.forEach((req) => {
    const studentSkill = student.skills.find((s) => s.skillId === req.skillId);
    const currentLevel = studentSkill ? studentSkill.proficiencyLevel : 0;
    const gapDelta = Math.max(0, req.requiredLevel - currentLevel);

    totalDelta += gapDelta;
    totalRequired += req.requiredLevel;

    if (currentLevel >= req.requiredLevel) {
      acquiredCount++;
    }

    if (req.isCritical && currentLevel < req.requiredLevel) {
      criticalMissingCount++;
    }

    // Priority formula:
    // (Market weight 40%) + (Gap Delta 40%) + (Criticality bonus 20%)
    const normalizedGap = gapDelta / 5;
    const priorityScore = Math.round(
      (req.marketWeight * 40) +
      (normalizedGap * 40) +
      (req.isCritical ? 20 : 0)
    );

    let urgency: 'Critical' | 'Medium' | 'Low' = 'Low';
    if (req.isCritical && gapDelta >= 2) {
      urgency = 'Critical';
    } else if (gapDelta > 0 && (req.isCritical || gapDelta >= 3)) {
      urgency = 'Medium';
    }

    gaps.push({
      skillId: req.skillId,
      skillName: req.skillName,
      category: req.category,
      requiredLevel: req.requiredLevel,
      currentLevel,
      gapDelta,
      isCritical: req.isCritical,
      priorityScore,
      marketDemand: Math.round(req.marketWeight * 100),
      urgency,
    });
  });

  // Sort gaps: Critical and highest priority score first
  gaps.sort((a, b) => {
    if (a.urgency === 'Critical' && b.urgency !== 'Critical') return -1;
    if (b.urgency === 'Critical' && a.urgency !== 'Critical') return 1;
    return b.priorityScore - a.priorityScore;
  });

  const overallGapIndex = Math.round((totalDelta / Math.max(1, totalRequired)) * 100);

  // Radar chart formatted data
  const radarData = role.skills.slice(0, 8).map((req) => {
    const studentSkill = student.skills.find((s) => s.skillId === req.skillId);
    return {
      skill: req.skillName.length > 15 ? req.skillName.slice(0, 14) + '…' : req.skillName,
      student: studentSkill ? studentSkill.proficiencyLevel : 0,
      industry: req.requiredLevel,
      fullMark: 5,
    };
  });

  return {
    role,
    gaps,
    acquiredSkillsCount: acquiredCount,
    criticalMissingCount,
    overallGapIndex,
    radarData,
  };
}
