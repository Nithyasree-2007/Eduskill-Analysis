import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import {
  History,
  TrendingUp,
  PlusCircle,
  Trash2,
  RotateCcw,
  Download,
  Calendar,
  Award,
  CheckCircle2,
  AlertCircle,
  Bookmark,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { JobRole, MLPredictionResult, ReadinessScoreSnapshot, SkillGapItem, StudentProfile } from '../types';
import { historyStorageService } from '../services/historyStorage';

interface ReadinessHistoryViewProps {
  student: StudentProfile;
  currentRole: JobRole;
  currentPrediction: MLPredictionResult;
  currentGaps: SkillGapItem[];
  acquiredCount: number;
  criticalMissingCount: number;
  onNavigateToDashboard?: () => void;
}

export const ReadinessHistoryView: React.FC<ReadinessHistoryViewProps> = ({
  student,
  currentRole,
  currentPrediction,
  currentGaps,
  acquiredCount,
  criticalMissingCount,
  onNavigateToDashboard,
}) => {
  const [history, setHistory] = useState<ReadinessScoreSnapshot[]>([]);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [noteInput, setNoteInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'line' | 'area'>('area');

  // Load history from local storage
  const loadHistory = () => {
    const records = historyStorageService.getStudentHistory(student.id);
    setHistory(records);
  };

  useEffect(() => {
    loadHistory();

    const handleStorageEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.studentId === student.id) {
        loadHistory();
      }
    };

    window.addEventListener('readiness-history-updated', handleStorageEvent);
    return () => {
      window.removeEventListener('readiness-history-updated', handleStorageEvent);
    };
  }, [student.id]);

  // Filtered history by role if chosen
  const filteredHistory = useMemo(() => {
    if (selectedRoleFilter === 'ALL') return history;
    return history.filter((h) => h.roleId === selectedRoleFilter);
  }, [history, selectedRoleFilter]);

  // Chart data
  const chartData = useMemo(() => {
    return filteredHistory.map((item, index) => {
      const d = new Date(item.timestamp);
      const shortDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        id: item.id,
        index: index + 1,
        date: shortDate,
        fullDate: item.displayDate,
        score: item.readinessScore,
        tier: item.readinessTier,
        role: item.roleTitle,
        coverage: item.criticalSkillCoverage,
        note: item.note || 'No notes provided',
      };
    });
  }, [filteredHistory]);

  // Metrics
  const firstRecord = filteredHistory.length > 0 ? filteredHistory[0] : null;
  const latestRecord = filteredHistory.length > 0 ? filteredHistory[filteredHistory.length - 1] : null;
  const highestScore = filteredHistory.length > 0 ? Math.max(...filteredHistory.map((h) => h.readinessScore)) : 0;
  const scoreGrowth = firstRecord && latestRecord ? latestRecord.readinessScore - firstRecord.readinessScore : 0;

  const handleSaveCurrentSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const topMissingNames = currentGaps
      .filter((g) => g.gapDelta > 0)
      .slice(0, 4)
      .map((g) => g.skillName);

    const snapshot = historyStorageService.saveSnapshot({
      studentId: student.id,
      roleId: currentRole.id,
      roleTitle: currentRole.title,
      readinessScore: currentPrediction.readinessScore,
      readinessTier: currentPrediction.readinessTier,
      confidenceScore: currentPrediction.confidenceScore,
      criticalSkillCoverage: currentPrediction.criticalSkillCoverage,
      acquiredSkillsCount: acquiredCount,
      criticalMissingCount: criticalMissingCount,
      topGaps: topMissingNames,
      note: noteInput.trim() || `Readiness evaluation for ${currentRole.title} (${currentPrediction.readinessTier})`,
      trigger: 'manual',
    });

    setNoteInput('');
    setIsSaving(false);
    setSaveSuccessMsg(`Snapshot saved! Logged score: ${snapshot.readinessScore}% (${snapshot.readinessTier})`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
    loadHistory();
  };

  const handleDeleteSnapshot = (id: string) => {
    if (window.confirm('Delete this historical evaluation from local storage?')) {
      const updated = historyStorageService.deleteSnapshot(student.id, id);
      setHistory(updated);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm(`Clear all saved readiness history for ${student.name}? This will remove all local storage snapshots.`)) {
      historyStorageService.clearStudentHistory(student.id);
      setHistory([]);
    }
  };

  const handleResetSeeds = () => {
    if (window.confirm(`Reset history to the standard benchmark progression for ${student.name}?`)) {
      const reset = historyStorageService.resetToDefaultHistory(student.id);
      setHistory(reset);
    }
  };

  const handleExportJson = () => {
    const jsonStr = historyStorageService.exportHistoryJson(student.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student.name.replace(/\s+/g, '_')}_readiness_history.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Industry Ready':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Job Competent':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Developing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                <History className="w-3 h-3" />
                Local Storage Persistence Layer
              </span>
              <span className="text-xs text-slate-500">
                {student.name} • {student.university}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Readiness Score History & Progression
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Track, audit, and visualize skill readiness evolution over time. Every assessment is stored locally in browser persistent memory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-xs"
              title="Download local history as JSON"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handleResetSeeds}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-xs"
              title="Reset to benchmark curriculum points"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Seeds</span>
            </button>
            <button
              onClick={handleClearHistory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
              title="Clear all saved history for this student"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{saveSuccessMsg}</span>
            </div>
            <button
              onClick={() => setSaveSuccessMsg(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Metric Highlights Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Current Readiness</span>
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {currentPrediction.readinessScore}%
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <span className={`px-1.5 py-0.5 rounded font-medium border ${getTierBadge(currentPrediction.readinessTier)}`}>
              {currentPrediction.readinessTier}
            </span>
            <span className="truncate">for {currentRole.title.split(' ')[0]}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Overall Growth</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className={`text-2xl font-bold ${scoreGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {scoreGrowth >= 0 ? `+${scoreGrowth}%` : `${scoreGrowth}%`}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            From baseline ({firstRecord ? `${firstRecord.readinessScore}%` : 'N/A'}) to latest
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Peak Score Recorded</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {highestScore}%
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Across {filteredHistory.length} saved snapshot{filteredHistory.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Persisted Evaluations</span>
            <Bookmark className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {history.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Stored in browser LocalStorage
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Section */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Skill Readiness Trajectory Over Time
            </h3>
            <p className="text-xs text-slate-500">
              Score evolution with industry readiness thresholds (Job Competent at 70%, Industry Ready at 85%)
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Chart Type Toggle */}
            <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-xs">
              <button
                onClick={() => setChartType('area')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  chartType === 'area' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Area
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  chartType === 'line' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Line
              </button>
            </div>

            {/* Role Filter */}
            <select
              aria-label="Filter history by job role"
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Recorded Roles</option>
              {Array.from(new Set(history.map((h) => h.roleId))).map((rId) => {
                const item = history.find((h) => h.roleId === rId);
                return (
                  <option key={rId} value={rId}>
                    {item?.roleTitle || rId}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No score history records found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Save your first snapshot using the form below or reset to the benchmark progression points.
            </p>
            <button
              onClick={handleResetSeeds}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Load Curriculum History</span>
            </button>
          </div>
        ) : (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 max-w-xs border border-slate-800">
                            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1">
                              <span className="font-semibold text-slate-300">{data.fullDate}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-600 text-white font-bold">
                                {data.score}%
                              </span>
                            </div>
                            <div className="text-[11px] text-indigo-300 font-medium">{data.role}</div>
                            <div className="text-[11px] text-slate-300">
                              Tier: <strong className="text-white">{data.tier}</strong> • Coverage: {data.coverage}%
                            </div>
                            <div className="text-[10px] text-slate-400 italic pt-0.5">&ldquo;{data.note}&rdquo;</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={85}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    label={{ value: 'Industry Ready (85%)', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }}
                  />
                  <ReferenceLine
                    y={70}
                    stroke="#3b82f6"
                    strokeDasharray="4 4"
                    label={{ value: 'Job Competent (70%)', fill: '#3b82f6', fontSize: 10, position: 'insideTopRight' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#scoreGradient)"
                    dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#ffffff' }}
                  />
                </AreaChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 max-w-xs border border-slate-800">
                            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1">
                              <span className="font-semibold text-slate-300">{data.fullDate}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-600 text-white font-bold">
                                {data.score}%
                              </span>
                            </div>
                            <div className="text-[11px] text-indigo-300 font-medium">{data.role}</div>
                            <div className="text-[11px] text-slate-300">
                              Tier: <strong className="text-white">{data.tier}</strong> • Coverage: {data.coverage}%
                            </div>
                            <div className="text-[10px] text-slate-400 italic pt-0.5">&ldquo;{data.note}&rdquo;</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={85} stroke="#10b981" strokeDasharray="4 4" />
                  <ReferenceLine y={70} stroke="#3b82f6" strokeDasharray="4 4" />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#ffffff' }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Snapshot Action: Save Live Score Snapshot */}
      <div className="bg-gradient-to-r from-indigo-50/70 via-white to-slate-50 rounded-2xl p-5 sm:p-6 border border-indigo-100/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Save Live Evaluation Snapshot
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Record Current Readiness State to Local Storage
            </h3>
            <p className="text-xs text-slate-600 max-w-xl">
              Captures current readiness ({currentPrediction.readinessScore}% for {currentRole.title}), critical skill coverage ({currentPrediction.criticalSkillCoverage}%), and existing gaps into persistent history.
            </p>
          </div>

          <form onSubmit={handleSaveCurrentSnapshot} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Milestone note (e.g. 'Completed Docker & CI/CD lab')"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-indigo-500 w-full sm:w-72 shadow-2xs"
            />
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Snapshot</span>
            </button>
          </form>
        </div>
      </div>

      {/* History Audit Log / Table */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            Evaluation Log Entries ({filteredHistory.length})
          </h3>
          <span className="text-xs text-slate-500">
            Ordered chronologically (Newest first)
          </span>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No entries recorded.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {[...filteredHistory].reverse().map((snapshot) => (
              <div
                key={snapshot.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl px-2 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {snapshot.roleTitle}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${getTierBadge(
                        snapshot.readinessTier
                      )}`}
                    >
                      {snapshot.readinessScore}% • {snapshot.readinessTier}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {snapshot.displayDate}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    {snapshot.note || 'Regular milestone assessment.'}
                  </p>

                  {snapshot.topGaps && snapshot.topGaps.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-medium">Blocking Gaps:</span>
                      {snapshot.topGaps.map((gap, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200/60"
                        >
                          {gap}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <div className="text-right hidden md:block">
                    <div className="text-xs font-semibold text-slate-800">
                      {snapshot.criticalSkillCoverage}% Coverage
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {snapshot.acquiredSkillsCount} Acquired • {snapshot.criticalMissingCount} Missing
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteSnapshot(snapshot.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete snapshot"
                    aria-label="Delete snapshot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
