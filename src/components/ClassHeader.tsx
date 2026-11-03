import React from 'react';
import { 
  BookOpen, 
  Plus, 
  Code2, 
  BarChart3, 
  Settings, 
  Download, 
  Users, 
  KeyRound, 
  FileSpreadsheet, 
  Database,
  RotateCcw,
  Sparkles,
  Sun,
  Moon,
  Languages
} from 'lucide-react';
import { ClassSettings, StudentCalculation } from '../types/classRecord';
import { Language, TRANSLATIONS } from '../utils/translations';

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
  lang?: Language;
  onToggleLang?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const ClassHeader: React.FC<ClassHeaderProps> = ({
  settings,
  calculations,
  onOpenAddStudent,
  onOpenGoogleScript,
  onOpenSettings,
  onOpenBatchInput,
  onExportCSV,
  onResetData,
  onOpenCredentials,
  onSwitchToStudentPortal,
  onOpenGoogleSheets,
  isGoogleSheetsConnected,
  connectedSheetName,
  onOpenFirebase,
  activeView,
  setActiveView,
  lang = 'en',
  onToggleLang,
  isDark = false,
  onToggleTheme,
}) => {
  const t = TRANSLATIONS[lang];
  const totalStudents = calculations.length;
  const passedStudents = calculations.filter((c) => c.isPassed).length;
  const passRate = totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(1) : '0';
  
  const avgGrandTotal = totalStudents > 0 
    ? (calculations.reduce((acc, curr) => acc + curr.grandTotal, 0) / totalStudents).toFixed(1)
    : '0';

  const grade4Count = calculations.filter((c) => c.grade === 4.0).length;

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors duration-200">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Logo & Subject Details */}
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="KR Class Record Logo" 
                className="w-11 h-11 sm:w-12 sm:h-12 object-contain rounded-full border-2 border-amber-400 bg-white shadow-md"
              />
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

          {/* Quick Action Buttons & Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Switcher (Spreadsheet vs Analytics) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveView('spreadsheet')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  activeView === 'spreadsheet'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t.navSpreadsheet}</span>
              </button>
              <button
                onClick={() => setActiveView('analytics')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  activeView === 'analytics'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{t.navAnalytics}</span>
              </button>
            </div>

            {/* Language Toggle */}
            {onToggleLang && (
              <button
                onClick={onToggleLang}
                className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
                title="Switch Language between English and Thai"
              >
                <Languages className="w-3.5 h-3.5 text-indigo-500" />
                <span>{lang === 'en' ? '🇹🇭 TH' : '🇬🇧 EN'}</span>
              </button>
            )}

            {/* Theme Toggle */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-2xs"
                title={isDark ? t.themeLight : t.themeDark}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              </button>
            )}

            {/* Cloud Firestore */}
            {onOpenFirebase && (
              <button
                onClick={onOpenFirebase}
                className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all flex items-center gap-1.5 shadow-2xs"
                title="Save & Load class records from Firebase Cloud Firestore"
              >
                <Database className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">{t.navCloudFirestore}</span>
              </button>
            )}

            {/* Google Sheets API */}
            <button
              onClick={onOpenGoogleSheets}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-2xs border ${
                isGoogleSheetsConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
              }`}
              title={isGoogleSheetsConnected ? `Connected to ${connectedSheetName || 'Google Sheet'}` : 'Connect Google Sheets & Drive'}
            >
              <FileSpreadsheet className={`w-3.5 h-3.5 ${isGoogleSheetsConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-emerald-600'}`} />
              <span>{t.navGoogleSheets}</span>
              {isGoogleSheetsConnected ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ) : null}
            </button>

            {/* Google Script Generator Modal */}
            <button
              onClick={onOpenGoogleScript}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm shadow-emerald-200 dark:shadow-none flex items-center gap-1.5"
              title="Get ready-to-run Google Apps Script for Google Sheets"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{t.navGoogleScript}</span>
            </button>

            {/* Add Student */}
            <button
              onClick={onOpenAddStudent}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.navAddStudent}</span>
            </button>

            {/* Passwords & Login Slips */}
            <button
              onClick={onOpenCredentials}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-all flex items-center gap-1.5"
              title="Manage student passwords & print login slips"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{t.navPasswords}</span>
            </button>

            {/* Student Portal Switcher */}
            <button
              onClick={onSwitchToStudentPortal}
              className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 shadow-2xs"
              title="Switch to Student Login view"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.navStudentPortal}</span>
            </button>

            {/* Batch Entry */}
            <button
              onClick={onOpenBatchInput}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.navQuickBatch}</span>
            </button>

            {/* Export & Settings Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={onExportCSV}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                title={t.navExportCSV}
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenSettings}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                title={t.navSettings}
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={onResetData}
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                title={t.navReset}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Pill Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
            <Users className="w-4 h-4 text-indigo-500" />
            <div className="text-xs">
              <span className="text-slate-500 dark:text-slate-400">{t.statStudents}: </span>
              <span className="font-bold text-slate-800 dark:text-white">{totalStudents}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <div className="text-xs">
              <span className="text-slate-500 dark:text-slate-400">{t.statPassRate}: </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{passRate}%</span>
              <span className="text-[10px] text-slate-400 ml-1">({passedStudents}/{totalStudents})</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <div className="text-xs">
              <span className="text-slate-500 dark:text-slate-400">{t.statClassAverage}: </span>
              <span className="font-bold text-slate-800 dark:text-white">{avgGrandTotal}</span>
              <span className="text-[10px] text-slate-400"> / 100</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">4.0</span>
            <div className="text-xs">
              <span className="text-slate-500 dark:text-slate-400">{t.statExcellentGrade4}: </span>
              <span className="font-bold text-slate-800 dark:text-white">{grade4Count}</span>
              <span className="text-[10px] text-slate-400 ml-1">
                ({totalStudents > 0 ? ((grade4Count / totalStudents) * 100).toFixed(0) : 0}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
