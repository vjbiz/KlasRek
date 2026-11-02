import React from 'react';
import { 
  BookOpen, 
  Plus, 
  Code2, 
  BarChart3, 
  Settings, 
  Download, 
  Users, 
  Award, 
  CheckCircle2, 
  GraduationCap,
  Sparkles,
  RotateCcw,
  KeyRound,
  FileSpreadsheet,
  Database
} from 'lucide-react';
import { ClassSettings, StudentCalculation } from '../types/classRecord';

interface ClassHeaderProps {
  settings: ClassSettings;
  calculations: StudentCalculation[];
  onOpenAddStudent: () => void;
  onOpenGoogleScript: () => void;
  onOpenAnalytics: () => void;
  onOpenSettings: () => void;
  onOpenBatchInput: () => void;
  onExportCSV: () => void;
  onPrintReport: () => void;
  onResetData: () => void;
  onOpenCredentials: () => void;
  onSwitchToStudentPortal: () => void;
  onOpenGoogleSheets: () => void;
  isGoogleSheetsConnected?: boolean;
  connectedSheetName?: string | null;
  onOpenFirebase?: () => void;
  activeView: 'spreadsheet' | 'analytics';
  setActiveView: (view: 'spreadsheet' | 'analytics') => void;
}

export const ClassHeader: React.FC<ClassHeaderProps> = ({
  settings,
  calculations,
  onOpenAddStudent,
  onOpenGoogleScript,
  onOpenSettings,
  onOpenBatchInput,
  onExportCSV,
  onPrintReport,
  onResetData,
  onOpenCredentials,
  onSwitchToStudentPortal,
  onOpenGoogleSheets,
  isGoogleSheetsConnected,
  connectedSheetName,
  onOpenFirebase,
  activeView,
  setActiveView,
}) => {
  const totalStudents = calculations.length;
  const passedStudents = calculations.filter((c) => c.isPassed).length;
  const passRate = totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(1) : '0';
  
  const avgGrandTotal = totalStudents > 0 
    ? (calculations.reduce((acc, curr) => acc + curr.grandTotal, 0) / totalStudents).toFixed(1)
    : '0';

  const grade4Count = calculations.filter((c) => c.grade === 4.0).length;

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Title & Subject Details */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-sm shadow-indigo-200 dark:shadow-none flex-shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {settings.subjectCode}
                </span>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {settings.subjectName}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                  {settings.className}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {settings.semester} • Academic Year {settings.academicYear} • Instructor: {settings.teacherName}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveView('spreadsheet')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  activeView === 'spreadsheet'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Spreadsheet
              </button>
              <button
                onClick={() => setActiveView('analytics')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  activeView === 'analytics'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Analytics
              </button>
            </div>

            {/* Firebase Cloud Firestore */}
            {onOpenFirebase && (
              <button
                onClick={onOpenFirebase}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all flex items-center gap-1.5 shadow-2xs"
                title="Save & Load class records from Firebase Cloud Firestore"
              >
                <Database className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Cloud Firestore</span>
              </button>
            )}

            {/* Google Sheets API Integration */}
            <button
              onClick={onOpenGoogleSheets}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-2xs border ${
                isGoogleSheetsConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
              }`}
              title={isGoogleSheetsConnected ? `Connected to ${connectedSheetName || 'Google Sheet'}` : 'Connect Google Sheets & Drive'}
            >
              <FileSpreadsheet className={`w-3.5 h-3.5 ${isGoogleSheetsConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-emerald-600'}`} />
              <span>Google Sheets</span>
              {isGoogleSheetsConnected ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Connected" />
              ) : (
                <span className="text-[10px] text-slate-400 font-normal">Connect</span>
              )}
            </button>

            {/* Google Script Generator Modal (Highlighted) */}
            <button
              onClick={onOpenGoogleScript}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm shadow-emerald-200 dark:shadow-none flex items-center gap-1.5"
              title="Get ready-to-run Google Apps Script for Google Sheets"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Google Script (.gs)</span>
              <span className="bg-emerald-500 text-[10px] px-1.5 py-0.2 rounded-full uppercase tracking-wider font-extrabold">UI Ready</span>
            </button>

            {/* Add Student */}
            <button
              onClick={onOpenAddStudent}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Student</span>
            </button>

            {/* Passwords & Login Slips */}
            <button
              onClick={onOpenCredentials}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-all flex items-center gap-1.5"
              title="Manage student passwords & print login slips"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Passwords</span>
            </button>

            {/* Student Portal Switcher */}
            <button
              onClick={onSwitchToStudentPortal}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 shadow-2xs"
              title="Switch to Student Login view"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Student Portal</span>
            </button>

            {/* Batch Entry */}
            <button
              onClick={onOpenBatchInput}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Batch</span>
            </button>

            {/* Export Menu Dropdown / Direct */}
            <div className="flex items-center gap-1">
              <button
                onClick={onExportCSV}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                title="Export as CSV for Google Sheets or Excel"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenSettings}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                title="Class Settings & Score Weights"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={onResetData}
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                title="Reset to Sample Class Data"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Pill Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
            <Users className="w-4 h-4 text-indigo-500" />
            <div className="text-xs">
              <span className="text-slate-500 dark:text-slate-400">Students: </span>
              <span className="font-bold text-slate-800 dark:text-white">{totalStudents}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
            <Award className="w-4 h-4 text-emerald-500" />
            <div className="text-xs">
              <span className="text-slate-500 dark:text-slate-400">Class Average: </span>
              <span className="font-bold text-slate-800 dark:text-white">{avgGrandTotal} / 100</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
            <div className="text-xs">
              <span className="text-slate-500 dark:text-slate-400">Pass Rate: </span>
              <span className="font-bold text-teal-600 dark:text-teal-400">{passRate}%</span>
              <span className="text-[10px] text-slate-400"> ({passedStudents}/{totalStudents})</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              4
            </span>
            <div className="text-xs">
              <span className="text-slate-500 dark:text-slate-400">Grade 4.0 (&ge; 80): </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{grade4Count} students</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
