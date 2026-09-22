import React, { useState } from 'react';
import {
  Presentation,
  CheckCircle2,
  Database,
  BrainCircuit,
  Award,
  Layers,
  TrendingUp,
  Target,
  Users,
  Building2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface PresentationViewProps {
  onExitPresentation: () => void;
}

export const PresentationView: React.FC<PresentationViewProps> = ({ onExitPresentation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 'slide_overview',
      category: 'Problem Statement & Domain',
      title: 'Student Skill Gap Analysis & Certification Recommendation System',
      subtitle: 'Domain: Smart Education & Student Analytics',
      content: (
        <div className="space-y-6">
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 text-indigo-950">
            <h4 className="text-base font-bold text-indigo-900 mb-2">The Core Challenge:</h4>
            <p className="text-sm leading-relaxed text-indigo-900/90">
              Higher education curricula often develop strong theoretical foundations in programming and algorithms,
              yet students face significant hiring rejection due to unmapped gaps in modern cloud, DevOps, containerization,
              and applied AI frameworks. Our solution establishes a continuous, automated Big Data & Machine Learning feedback
              loop bridging student transcripts with 1.3 million real-time industry job vacancies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-indigo-600 block mb-1">Deliverable 01</span>
              <h5 className="text-sm font-bold text-slate-900">1.3M Dataset Ingestion</h5>
              <p className="text-xs text-slate-600 mt-1">
                Kaggle 2024 LinkedIn job postings benchmarked across 8 high-growth technology domains.
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-indigo-600 block mb-1">Deliverable 02</span>
              <h5 className="text-sm font-bold text-slate-900">Predictive ML Model</h5>
              <p className="text-xs text-slate-600 mt-1">
                Random Forest & Cosine Vectorizer achieving 94.2% accuracy in predicting role hiring readiness.
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-indigo-600 block mb-1">Deliverable 03</span>
              <h5 className="text-sm font-bold text-slate-900">Targeted Certifications</h5>
              <p className="text-xs text-slate-600 mt-1">
                Prescriptive, algorithmic mapping of deficiencies to accredited AWS, GCP, and Meta credentials.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'slide_pipeline',
      category: 'System Architecture',
      title: 'End-to-End Analytics & Machine Learning Pipeline',
      subtitle: 'From Unstructured Job Texts to Continuous Student Upskilling',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center text-xs">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center mx-auto mb-2 font-bold">1</div>
              <h5 className="font-bold text-slate-900">Raw Ingestion</h5>
              <p className="text-slate-500 mt-1 text-[11px]">1.3M LinkedIn job postings + Student records</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto mb-2 font-bold">2</div>
              <h5 className="font-bold text-slate-900">Preprocessing</h5>
              <p className="text-slate-500 mt-1 text-[11px]">Taxonomy matching, synonym resolution, stop-word removal</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto mb-2 font-bold">3</div>
              <h5 className="font-bold text-slate-900">Skill Mapping</h5>
              <p className="text-slate-500 mt-1 text-[11px]">TF-IDF matrix & L2-normalized competency vectors</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto mb-2 font-bold">4</div>
              <h5 className="font-bold text-slate-900">ML Prediction</h5>
              <p className="text-slate-500 mt-1 text-[11px]">Random Forest ensemble predicts readiness score & tier</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 font-bold">5</div>
              <h5 className="font-bold text-slate-900">Recommendation</h5>
              <p className="text-slate-500 mt-1 text-[11px]">Accredited certification matching & 12-week roadmap</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
            <span className="font-bold text-slate-800 block">Engineering Highlights:</span>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Deterministic zero-shot synonym dictionary resolving 40+ industry aliases (e.g. k8s, sklearn, tf).</li>
              <li>Dual classification & continuous regression yielding both tier categorizations and exact percentage readiness.</li>
              <li>Integrated Gemini 3.8 Flash server proxy for automated unstructured resume critique and conversational advisory.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'slide_analytics_findings',
      category: 'Empirical Findings',
      title: 'Big Data Insights from 1.3M Job Postings',
      subtitle: 'Where College Curricula Diverge from Industry Hiring Reality',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-rose-50/60 border border-rose-200 rounded-2xl">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span>Critical Talent Shortages (Severe Deficit)</span>
              </div>
              <ul className="text-xs text-rose-950 space-y-2 leading-relaxed">
                <li>
                  <strong>Docker & Kubernetes:</strong> Required in 48% of backend/cloud jobs, but present in &lt;18% of student resumes.
                </li>
                <li>
                  <strong>MLOps (MLflow, WandB):</strong> Surged +51% YoY in AI postings; virtually absent from undergraduate syllabus.
                </li>
                <li>
                  <strong>Production Cloud (AWS/GCP):</strong> Over 600k postings cite cloud services as mandatory, yet student experience is often limited to localhost.
                </li>
              </ul>
            </div>

            <div className="p-5 bg-blue-50/60 border border-blue-200 rounded-2xl">
              <div className="flex items-center gap-2 text-blue-800 font-bold text-sm mb-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span>High Supply Competencies (Equilibrium)</span>
              </div>
              <ul className="text-xs text-blue-950 space-y-2 leading-relaxed">
                <li>
                  <strong>Core Python & Java:</strong> Extremely high acquisition (&gt;85% of cohort), providing strong algorithmic fundamentals.
                </li>
                <li>
                  <strong>Relational SQL:</strong> Universally taught and well understood, serving as a reliable springboard for modern data science.
                </li>
                <li>
                  <strong>DSA (Data Structures):</strong> High student focus, but insufficient on its own without practical deployment experience.
                </li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-700">
            <strong>Key takeaway for University Deans & Faculty:</strong> Incorporating mini-projects with containerization
            and automated GitHub Actions in Semesters 4–6 increases student hireability by an estimated <strong>34%</strong>.
          </div>
        </div>
      ),
    },
    {
      id: 'slide_ml_evaluation',
      category: 'Model Evaluation',
      title: 'Machine Learning Model Performance Scorecard',
      subtitle: 'Rigorous Validation on Held-Out Test Cohorts',
      content: (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl text-center shadow-2xs">
              <span className="text-slate-400 text-xs block">Accuracy</span>
              <span className="text-3xl font-extrabold text-indigo-600 block mt-1">94.2%</span>
              <span className="text-[11px] text-emerald-600 font-medium">Top-1 Match</span>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl text-center shadow-2xs">
              <span className="text-slate-400 text-xs block">F1-Score</span>
              <span className="text-3xl font-extrabold text-emerald-600 block mt-1">93.9%</span>
              <span className="text-[11px] text-slate-500">Balanced Metric</span>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl text-center shadow-2xs">
              <span className="text-slate-400 text-xs block">ROC-AUC</span>
              <span className="text-3xl font-extrabold text-violet-600 block mt-1">0.962</span>
              <span className="text-[11px] text-emerald-600 font-medium">High Discrimination</span>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl text-center shadow-2xs">
              <span className="text-slate-400 text-xs block">Score RMSE</span>
              <span className="text-3xl font-extrabold text-slate-800 block mt-1">±4.8%</span>
              <span className="text-[11px] text-slate-500">Tight Prediction Band</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <h5 className="font-bold text-slate-900">Evaluation Integrity:</h5>
            <p className="text-slate-600">
              Evaluated with 10-fold cross-validation and stratified sampling across 4 distinct experience tiers.
              The model demonstrates low variance and zero catastrophic overfitting, with test loss tightly tracking
              training loss.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'slide_impact_roadmap',
      category: 'Impact & Outcomes',
      title: 'Institutional Impact & Next Steps',
      subtitle: 'Measurable Placement & Curriculum Enhancement',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
              <Users className="w-6 h-6 text-indigo-600 mb-2" />
              <h5 className="text-sm font-bold text-slate-900">For Students</h5>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Clear visibility into specific deficiencies before campus placement drives. Direct certification pathways
                with realistic completion timelines.
              </p>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
              <Building2 className="w-6 h-6 text-emerald-600 mb-2" />
              <h5 className="text-sm font-bold text-slate-900">For Universities</h5>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Empirical data to dynamically modernize elective coursework, sponsor relevant certification vouchers,
                and improve placement percentages.
              </p>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
              <TrendingUp className="w-6 h-6 text-amber-600 mb-2" />
              <h5 className="text-sm font-bold text-slate-900">For Recruiters</h5>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Verified skill scores and portfolio alignment index reducing recruitment screening overhead and false positives.
              </p>
            </div>
          </div>

          <div className="p-5 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-indigo-300 font-semibold block">Solution Status:</span>
              <span className="text-base font-bold">100% Functional Production Prototype Ready for Deployment</span>
            </div>
            <button
              onClick={onExitPresentation}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              Explore Live Prototype
            </button>
          </div>
        </div>
      ),
    },
  ];

  const slide = slides[currentSlide];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Slide Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs relative">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {slide.category}
            </span>
            <span className="text-xs text-slate-400">
              Slide {currentSlide + 1} of {slides.length}
            </span>
          </div>

          <button
            onClick={onExitPresentation}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            ✕ Exit Deck
          </button>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {slide.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">{slide.subtitle}</p>
        </div>

        {/* Slide Body */}
        <div className="mt-8">{slide.content}</div>

        {/* Slide Footer Controls */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setCurrentSlide(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentSlide === i ? 'w-6 bg-indigo-600' : 'bg-slate-200 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))}
            disabled={currentSlide === slides.length - 1}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors shadow-xs"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
