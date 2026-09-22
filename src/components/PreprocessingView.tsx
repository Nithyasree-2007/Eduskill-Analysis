import React, { useState } from 'react';
import {
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FileCode,
  Sliders,
  Terminal,
  RefreshCw,
} from 'lucide-react';
import {
  extractSkillsFromText,
  getPipelineAuditTrail,
  normalizeText,
  SKILL_SYNONYM_MAP,
} from '../services/preprocessing';
import { StudentProfile } from '../types';

interface PreprocessingViewProps {
  student: StudentProfile;
}

export const PreprocessingView: React.FC<PreprocessingViewProps> = ({ student }) => {
  const [testText, setTestText] = useState<string>(
    'Student has built microservices in React.js, Node.js and Postgres. Deployed with Docker containers on AWS EC2. Basic familiarity with K8s and Scikit-Learn.'
  );
  const [extractedSkills, setExtractedSkills] = useState(extractSkillsFromText(testText));

  const steps = getPipelineAuditTrail(student);

  const handleRunExtraction = () => {
    setExtractedSkills(extractSkillsFromText(testText));
  };

  const sampleTexts = [
    {
      title: 'Full Stack Web Resume',
      text: 'Developed responsive UI components using ReactJS, TypeScript, and TailwindCSS. Built REST APIs using Express and PostgreSQL. Used Git and Docker for local CI/CD.',
    },
    {
      title: 'ML & AI Researcher',
      text: 'Proficient in Python, PyTorch, and Scikit-Learn. Built RAG applications with LangChain and vector databases. Deployed FastAPI server on GCP with MLflow.',
    },
    {
      title: 'DevOps & Cloud Engineer',
      text: 'Managed Kubernetes (K8s) clusters on AWS. Wrote Terraform IaC blueprints and automated deployments with GitHub Actions and Linux shell scripts.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div>
          <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            Pipeline Architecture
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Data Preprocessing, Cleaning & Feature Selection
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Demonstrating end-to-end data ingestion, text tokenization, canonical synonym mapping against 1.3M LinkedIn
            job requirements, and numeric feature tensor synthesis for the downstream ML models.
          </p>
        </div>

        {/* Pipeline Stage Badges */}
        <div className="flex items-center gap-2 overflow-x-auto py-4 mt-2 no-scrollbar text-xs">
          {['1. Raw Data Ingestion', '2. Text Normalization', '3. Synonym Mapping', '4. TF-IDF Scaling', '5. ML Feature Matrix'].map(
            (stage, idx) => (
              <React.Fragment key={stage}>
                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 whitespace-nowrap flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{stage}</span>
                </div>
                {idx < 4 && <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />}
              </React.Fragment>
            )
          )}
        </div>
      </div>

      {/* Interactive Extraction Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Text Input */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Live Skill Entity Extraction Engine
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">NLP & Taxonomy Matcher</span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Type or paste unstructured text (resume snippet, project write-up, or course description) to test canonical normalization.
            </p>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {sampleTexts.map((sample) => (
                <button
                  key={sample.title}
                  onClick={() => {
                    setTestText(sample.text);
                    setExtractedSkills(extractSkillsFromText(sample.text));
                  }}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  {sample.title}
                </button>
              ))}
            </div>

            <textarea
              aria-label="Interactive test text for skill extraction"
              rows={4}
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              placeholder="Paste student resume text or job description here..."
            />
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Normalized: {normalizeText(testText).slice(0, 45)}...
            </span>
            <button
              onClick={handleRunExtraction}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Extract Entities</span>
            </button>
          </div>
        </div>

        {/* Right: Extracted Entities Result */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">
                Extracted Canonical Industry Skills
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                {extractedSkills.length} Detected
              </span>
            </div>

            {extractedSkills.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No recognized skills found. Try typing &apos;Python&apos;, &apos;K8s&apos;, &apos;React&apos;, or &apos;Docker&apos;.
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {extractedSkills.map((sk) => (
                  <div
                    key={sk.skillId}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="font-bold text-slate-900">{sk.skillName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        (id: {sk.skillId})
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-indigo-700">
                      {(sk.confidence * 100).toFixed(0)}% Confidence
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Synonym Dictionary: {Object.keys(SKILL_SYNONYM_MAP).length} Alias Rules Active</span>
            <span className="font-medium text-slate-700">Zero-Shot Token Canonicalizer</span>
          </div>
        </div>
      </div>

      {/* Audit Trail Timeline */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Execution Trace: Transformation of Profile ({student.name})
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Detailed log showing input, algorithm application, and output at each preprocessing checkpoint.
        </p>

        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.stepNumber}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                    {step.stepNumber}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{step.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Latency: {step.durationMs}ms</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    {step.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-3">{step.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Input Snapshot:
                  </span>
                  <div className="text-slate-700 truncate">{step.inputSample}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-indigo-500 block mb-1">
                    Output Transformed Tensor:
                  </span>
                  <div className="text-indigo-900 truncate">{step.outputSample}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
