import { ALL_CERTIFICATIONS } from '../data/certificationsData';
import { CertificationRecommendation, LearningMilestone, SkillGapItem, StudentProfile } from '../types';

export function generateCertificationRecommendations(
  student: StudentProfile,
  gaps: SkillGapItem[]
): CertificationRecommendation[] {
  // Extract all skills that have a deficit (gapDelta > 0)
  const missingSkillIds = new Set(gaps.filter((g) => g.gapDelta > 0).map((g) => g.skillId));
  const completedCertIds = new Set(student.completedCertifications);

  const recommendations: CertificationRecommendation[] = [];

  ALL_CERTIFICATIONS.forEach((cert) => {
    // Skip if already completed
    if (completedCertIds.has(cert.id)) return;

    // Check which missing skills are covered by this certification
    const targetedGaps = cert.skillsCovered.filter((s) => missingSkillIds.has(s));

    if (targetedGaps.length === 0) return;

    // Compute Match Score:
    // based on number of missing skills covered, criticality of those skills, and cert demand score
    let criticalGapsCoveredCount = 0;
    targetedGaps.forEach((skillId) => {
      const gap = gaps.find((g) => g.skillId === skillId);
      if (gap && gap.isCritical) criticalGapsCoveredCount++;
    });

    const matchScore = Math.min(
      99,
      Math.round(
        (targetedGaps.length * 22) +
        (criticalGapsCoveredCount * 26) +
        (cert.industryDemandScore * 0.25)
      )
    );

    // Expected readiness uplift
    const expectedReadinessUplift = Math.min(
      24,
      Math.round(targetedGaps.length * 4.5 + criticalGapsCoveredCount * 5.5)
    );

    // Human-readable reasoning
    const targetedNames = targetedGaps
      .map((id) => gaps.find((g) => g.skillId === id)?.skillName || id)
      .slice(0, 3)
      .join(', ');

    const reasoning = `Directly closes high-priority gaps in ${targetedNames}. Recognized by top employers with an industry demand score of ${cert.industryDemandScore}/100.`;

    recommendations.push({
      certification: cert,
      matchScore,
      targetedGaps,
      expectedReadinessUplift,
      priorityRank: 0,
      reasoning,
    });
  });

  // Sort by match score descending
  recommendations.sort((a, b) => b.matchScore - a.matchScore);

  // Assign priority ranks
  return recommendations.map((rec, index) => ({
    ...rec,
    priorityRank: index + 1,
  }));
}

export function generatePersonalizedRoadmap(
  gaps: SkillGapItem[],
  topRecommendations: CertificationRecommendation[]
): LearningMilestone[] {
  const criticalGaps = gaps.filter((g) => g.urgency === 'Critical').slice(0, 3);
  const secondaryGaps = gaps.filter((g) => g.urgency !== 'Critical' && g.gapDelta > 0).slice(0, 3);
  const primaryCert = topRecommendations[0]?.certification;
  const secondaryCert = topRecommendations[1]?.certification;

  return [
    {
      weekRange: 'Weeks 1 - 3',
      phaseTitle: 'Phase 1: Critical Foundation & Core Gaps',
      focusSkills: criticalGaps.map((g) => g.skillName),
      recommendedAction: `Complete core syntax, laboratory exercises, and foundational tutorials addressing critical deficits in ${criticalGaps.map((g) => g.skillName).join(', ')}.`,
      targetCertification: primaryCert ? primaryCert.title : undefined,
    },
    {
      weekRange: 'Weeks 4 - 7',
      phaseTitle: 'Phase 2: Applied Project & Architecture Implementation',
      focusSkills: [...criticalGaps.map((g) => g.skillName), ...secondaryGaps.map((g) => g.skillName)].slice(0, 4),
      recommendedAction: 'Build an end-to-end portfolio project deploying these tools to GitHub with automated CI/CD and containerization.',
      targetCertification: primaryCert ? `${primaryCert.provider} Curriculum Completion` : undefined,
    },
    {
      weekRange: 'Weeks 8 - 10',
      phaseTitle: 'Phase 3: Certification Exam & Industry Validation',
      focusSkills: secondaryGaps.map((g) => g.skillName),
      recommendedAction: `Take mock exams, review official documentation blueprints, and sit for official proctored assessment.`,
      targetCertification: secondaryCert ? secondaryCert.title : primaryCert?.title,
    },
    {
      weekRange: 'Weeks 11 - 12',
      phaseTitle: 'Phase 4: Resume Synchronization & Mock Technical Interview',
      focusSkills: ['System Design', 'Code Review', 'Portfolio Showcase'],
      recommendedAction: 'Publish project artifacts, showcase verified credential badges on LinkedIn, and prepare for domain-specific coding rounds.',
    },
  ];
}
