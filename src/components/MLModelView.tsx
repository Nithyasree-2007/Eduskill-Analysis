import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  BrainCircuit,
  CheckCircle,
  Activity,
  Layers,
  Gauge,
  HelpCircle,
  Sliders,
} from 'lucide-react';
import {
  MODEL_EVALUATION_METRICS,
  ROC_CURVE_DATA,
  TRAINING_EPOCHS_DATA,
} from '../services/mlModel';

export const MLModelView: React.FC = () => {
  const metrics = MODEL_EVALUATION_METRICS;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                Machine Learning Model Engine
              </span>
              <span className="text-xs text-slate-500">
                Supervised Ensemble Classifier & Cosine Vectorizer
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Skill Readiness Prediction & Evaluation Metrics
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Trained on multi-dimensional feature representations derived from student proficiency vectors, verified projects,
              and 1.3M industry job criteria. Evaluated using standard classification and regression benchmarks.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Test Validation Split:</span>
              <span className="font-bold text-slate-800">85% Train / 15% Test</span>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div>
              <span className="text-slate-500 block">Total Synthetic Cohorts:</span>
              <span className="font-bold text-slate-800">10,000 Samples</span>
            </div>
          </div>
        </div>
      </div>

      {/* Model Performance KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Accuracy</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {(metrics.accuracy * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Top-1 Classification</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Precision</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 mt-1">
            {(metrics.precision * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-500">Low False Positives</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Recall</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">
            {(metrics.recall * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-500">Captures Gap Deficits</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">F1-Score</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
            {(metrics.f1Score * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-500">Harmonic Mean</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">ROC-AUC</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-violet-600 mt-1">
            {metrics.rocAuc.toFixed(3)}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Discriminative Power</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">RMSE</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-700 mt-1">
            ±{metrics.rmse}%
          </div>
          <span className="text-[11px] text-slate-500">Score Residual Error</span>
        </div>
      </div>

      {/* Grid: Feature Importance & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Feature Importance */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Random Forest Feature Importance Weights
              </h3>
              <p className="text-xs text-slate-500">
                Normalized contribution of input features to final readiness tier prediction.
              </p>
            </div>
            <Sliders className="w-4 h-4 text-indigo-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={metrics.featureImportances}
                margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 0.4]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                <YAxis type="category" dataKey="feature" tick={{ fontSize: 11, fill: '#475569' }} width={140} />
                <Tooltip formatter={(val: any) => [`${(Number(val) * 100).toFixed(1)}%`, 'Weight']} />
                <Bar dataKey="weight" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-3 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <strong>Key takeaway:</strong> Skill vector cosine similarity (35%) and applied project depth (25%)
            exert the strongest predictive influence on hiring readiness, outpacing academic GPA alone.
          </p>
        </div>

        {/* Right: Confusion Matrix */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Readiness Tier Confusion Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  True labels vs Predicted labels on 1,500 held-out evaluation test instances.
                </p>
              </div>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                N = 1,500
              </span>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 border border-slate-200 bg-slate-50 text-slate-500 font-semibold text-left">
                      True \ Pred
                    </th>
                    {metrics.confusionMatrix.labels.map((label) => (
                      <th key={label} className="p-2 border border-slate-200 bg-slate-50 font-bold text-slate-700">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.confusionMatrix.matrix.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td className="p-2 border border-slate-200 font-bold text-slate-700 bg-slate-50/70 text-left">
                        {metrics.confusionMatrix.labels[rIdx]}
                      </td>
                      {row.map((cell, cIdx) => {
                        const isDiagonal = rIdx === cIdx;
                        return (
                          <td
                            key={cIdx}
                            className={`p-2 border border-slate-200 font-semibold transition-colors ${
                              isDiagonal
                                ? 'bg-indigo-50 text-indigo-900 font-bold'
                                : cell > 10
                                ? 'bg-amber-50/70 text-amber-800'
                                : 'text-slate-500'
                            }`}
                          >
                            {cell}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Diagonal cells denote correct predictions</span>
            <span className="font-semibold text-emerald-600">Total Correct: 1,397 / 1,500</span>
          </div>
        </div>
      </div>

      {/* Convergence Curve & ROC Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: ROC Curve */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">ROC Curve (Receiver Operating Characteristic)</h3>
              <p className="text-xs text-slate-500">True Positive Rate vs False Positive Rate (AUC = 0.962)</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ROC_CURVE_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="fpr" tick={{ fontSize: 11, fill: '#64748b' }} unit="" label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -4, fontSize: 11 }} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                <Tooltip formatter={(val: any) => [val, 'TPR']} />
                <Line type="monotone" dataKey="tpr" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Training Convergence */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Model Convergence Across Epochs</h3>
              <p className="text-xs text-slate-500">Train vs Validation Loss curve demonstrating absence of overfitting</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TRAINING_EPOCHS_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="epoch" tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'Training Epochs', position: 'insideBottom', offset: -4, fontSize: 11 }} />
                <YAxis domain={[0, 0.8]} tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'Cross-Entropy Loss', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                <Line type="monotone" dataKey="trainLoss" name="Training Loss" stroke="#4f46e5" strokeWidth={2} />
                <Line type="monotone" dataKey="valLoss" name="Validation Loss" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
