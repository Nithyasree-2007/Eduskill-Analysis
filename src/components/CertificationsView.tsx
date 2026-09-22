import React, { useState } from 'react';
import {
  Award,
  Clock,
  DollarSign,
  ExternalLink,
  CheckCircle2,
  Filter,
  Calendar,
  Sparkles,
  Search,
} from 'lucide-react';
import { ALL_CERTIFICATIONS } from '../data/certificationsData';
import { generatePersonalizedRoadmap } from '../services/recommendation';
import { CertificationRecommendation, SkillGapItem, StudentProfile } from '../types';

interface CertificationsViewProps {
  student: StudentProfile;
  gaps: SkillGapItem[];
  recommendations: CertificationRecommendation[];
}

export const CertificationsView: React.FC<CertificationsViewProps> = ({
  student,
  gaps,
  recommendations,
}) => {
  const [providerFilter, setProviderFilter] = useState<string>('All');
  const [levelFilter, setLevelFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const roadmap = generatePersonalizedRoadmap(gaps, recommendations);

  const providers = Array.from(new Set(ALL_CERTIFICATIONS.map((c) => c.provider)));

  const filteredCerts = ALL_CERTIFICATIONS.filter((cert) => {
    if (providerFilter !== 'All' && cert.provider !== providerFilter) return false;
    if (levelFilter !== 'All' && cert.level !== levelFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = cert.title.toLowerCase().includes(q);
      const matchSkills = cert.skillsCovered.some((s) => s.toLowerCase().includes(q));
      if (!matchTitle && !matchSkills) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                Accredited Credentials Directory
              </span>
              <span className="text-xs text-slate-500">
                Curated for Direct Employer Recognition
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Certifications & Personalized Learning Roadmap
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Targeted certifications matched to close the specific skill deficiencies identified in {student.name}&apos;s profile.
              Follow the structured 12-week roadmap to reach industry readiness.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold block">Smart Uplift Engine Active</span>
              <span>Projected +{recommendations[0]?.expectedReadinessUplift || 18}% jump upon completion</span>
            </div>
          </div>
        </div>
      </div>

      {/* Week-by-Week Learning Roadmap Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Personalized 12-Week Strategic Roadmap
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Customized for {student.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roadmap.map((phase, idx) => (
            <div
              key={phase.weekRange}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    {phase.weekRange}
                  </span>
                  <span className="text-xs font-bold text-slate-400">Step 0{idx + 1}</span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-1.5">{phase.phaseTitle}</h4>
                <p className="text-xs text-slate-600 mb-3">{phase.recommendedAction}</p>

                {/* Target Skills */}
                <div className="mb-3">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Key Competencies:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {phase.focusSkills.map((sk) => (
                      <span
                        key={sk}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {phase.targetCertification && (
                <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-indigo-700 font-semibold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{phase.targetCertification}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Catalog Search and Filter Controls */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Complete Industry Certifications Catalog
            </h3>
            <p className="text-xs text-slate-500">
              Browse {ALL_CERTIFICATIONS.length} accredited certifications benchmarked against hiring requirements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search Box */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search certification or skill..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Provider Filter */}
            <select
              aria-label="Filter certification provider"
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="All">All Providers</option>
              {providers.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            {/* Level Filter */}
            <select
              aria-label="Filter difficulty level"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Certifications Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCerts.map((cert) => {
            const isRecommended = recommendations.some((r) => r.certification.id === cert.id);
            const recMatch = recommendations.find((r) => r.certification.id === cert.id);

            return (
              <div
                key={cert.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isRecommended
                    ? 'border-indigo-300 bg-indigo-50/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {cert.provider}
                    </span>
                    {isRecommended ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>+{recMatch?.expectedReadinessUplift}% Match</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-medium">
                        {cert.level}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{cert.title}</h4>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{cert.careerOutcome}</p>

                  {/* Skills Covered */}
                  <div className="mt-3">
                    <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                      Skills Certified:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {cert.skillsCovered.map((sk) => (
                        <span
                          key={sk}
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Meta */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div className="text-slate-500 flex items-center gap-2">
                    <span>{cert.durationWeeks} weeks</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">
                      {cert.isFreeOrFinancialAid ? 'Free / Financial Aid' : `$${cert.costUsd}`}
                    </span>
                  </div>

                  <a
                    href={cert.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    <span>Curriculum</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
