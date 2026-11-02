import React from 'react';
import { 
  LogOut, 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Award, 
  BookOpen, 
  Mic, 
  HelpCircle, 
  BookMarked, 
  FileText, 
  Printer, 
  ShieldCheck, 
  Clock, 
  User,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { AttendanceDay, ClassSettings, ScoreColumn, StudentCalculation } from '../types/classRecord';
import { REMARKS_INFO, THAI_GRADE_SCALE } from '../utils/gradeCalculations';

interface StudentDashboardProps {
  calculation: StudentCalculation;
  attendanceDays: AttendanceDay[];
  speakingColumns: ScoreColumn[];
  quizzesColumns: ScoreColumn[];
  participationColumns: ScoreColumn[];
  notebookColumns: ScoreColumn[];
  settings: ClassSettings;
  onLogout: () => void;
  onSwitchToTeacher?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  calculation,
  attendanceDays,
  speakingColumns,
  quizzesColumns,
  participationColumns,
  notebookColumns,
  settings,
  onLogout,
  onSwitchToTeacher,
}) => {
  const { student } = calculation;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-12 font-sans">
      {/* Top Navbar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-mono">
                  {settings.subjectCode}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white hidden sm:inline">
                  {settings.subjectName}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Student Academic Grade & Attendance Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
              title="Print official student report slip"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Slip</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-xs flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Student Report Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Student Profile & Grade Hero Card */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Student Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  Seat No. #{student.number}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-white/10 text-slate-200">
                  ID: {student.studentNumber}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {settings.className}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {student.thaiName}
              </h1>
              <p className="text-base text-indigo-200 font-medium">
                {student.englishName}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400">
                <span>Subject: <strong className="text-slate-200">{settings.subjectCode} {settings.subjectName}</strong></span>
                <span>Term: <strong className="text-slate-200">{settings.semester}</strong></span>
                <span>Year: <strong className="text-slate-200">{settings.academicYear}</strong></span>
                <span>Instructor: <strong className="text-slate-200">{settings.teacherName}</strong></span>
              </div>
            </div>

            {/* Official Thai Grade Badge & Grand Total */}
            <div className="flex sm:flex-col items-center justify-between sm:justify-center p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 min-w-[200px] text-center">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold block">
                  Official Grade (เกรด)
                </span>
                <div className="text-4xl sm:text-5xl font-black text-amber-400 drop-shadow-md my-0.5">
                  {calculation.grade.toFixed(1)}
                </div>
                <div className="text-xs font-bold text-emerald-300">
                  {calculation.gradeThaiLabel} ({calculation.gradeLabel})
                </div>
              </div>

              <div className="sm:mt-3 pt-2 sm:border-t sm:border-white/20 text-right sm:text-center">
                <div className="text-[10px] uppercase text-slate-300 font-semibold">Grand Total Score</div>
                <div className="text-xl sm:text-2xl font-black text-white">
                  {calculation.grandTotal.toFixed(2)} <span className="text-xs text-slate-300 font-normal">/ 100</span>
                </div>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  calculation.isPassed ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/30' : 'bg-rose-500/30 text-rose-300 border border-rose-400/30'
                }`}>
                  {calculation.isPassed ? 'Passed (ผ่าน)' : 'Failed (ไม่ผ่าน)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Score Summary Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
              Formative Earned (คะแนนเก็บ)
            </span>
            <div className="text-xl font-black text-sky-600 dark:text-sky-400 mt-1">
              {calculation.earnedScores.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ {settings.earnedMaxScore}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Att + Spk + Quiz + Part + NB
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
              Midterm Exam (กลางภาค)
            </span>
            <div className="text-xl font-black text-teal-600 dark:text-teal-400 mt-1">
              {calculation.midtermScore.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ {settings.midtermMaxScore}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Weight: 20%
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
              Final Exam (ปลายภาค)
            </span>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {calculation.finalScore.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ {settings.finalMaxScore}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Weight: 20%
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
              Attendance Rate
            </span>
            <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {attendanceDays.length > 0 ? ((calculation.presencesCount / attendanceDays.length) * 100).toFixed(0) : 0}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {calculation.presencesCount} of {attendanceDays.length} sessions
            </div>
          </div>
        </div>

        {/* Detailed Assessment Categories */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>Academic Performance Breakdown (รายละเอียดคะแนนรายวิชา)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Attendance Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">Attendance (เวลาเรียน)</h3>
                    <span className="text-[10px] text-slate-500">Remarks: P, A, L, E, S</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {calculation.attendanceScore.toFixed(2)} / {settings.attendanceMaxScore} pts
                  </span>
                </div>
              </div>

              {/* Attendance breakdown pills */}
              <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">{calculation.presencesCount}</span>
                  <span className="block text-[9px] text-slate-500">Present (P)</span>
                </div>
                <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                  <span className="font-bold text-rose-700 dark:text-rose-300">{calculation.absentsCount}</span>
                  <span className="block text-[9px] text-slate-500">Absent (A)</span>
                </div>
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <span className="font-bold text-amber-700 dark:text-amber-300">{calculation.latesCount}</span>
                  <span className="block text-[9px] text-slate-500">Late (L)</span>
                </div>
                <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
                  <span className="font-bold text-sky-700 dark:text-sky-300">{calculation.excusedCount}</span>
                  <span className="block text-[9px] text-slate-500">Excused (E)</span>
                </div>
                <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                  <span className="font-bold text-purple-700 dark:text-purple-300">{calculation.sickCount}</span>
                  <span className="block text-[9px] text-slate-500">Sick (S)</span>
                </div>
              </div>

              {/* Day-by-day logs */}
              <div>
                <span className="text-[10px] font-semibold text-slate-500 block mb-1.5">Session Logs:</span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {attendanceDays.map((d) => {
                    const rem = student.attendance[d.id] || '';
                    const info = rem ? REMARKS_INFO[rem] : null;
                    return (
                      <span 
                        key={d.id} 
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${info ? info.badgeBg : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                      >
                        {d.name}: {rem || '-'}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. Speaking Scores Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">Speaking Scores (ทักษะการพูด)</h3>
                    <span className="text-[10px] text-slate-500">{speakingColumns.length} evaluated tasks</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {calculation.speakingScore.toFixed(2)} / {settings.speakingMaxScore} pts
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                {speakingColumns.map((col) => {
                  const val = student.speakingScores[col.id];
                  const pct = val !== null && val !== undefined ? (val / col.maxScore) * 100 : 0;
                  return (
                    <div key={col.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                      <span className="text-slate-600 dark:text-slate-400">{col.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 min-w-[45px] text-right">
                          {val !== null && val !== undefined ? val : '-'} / {col.maxScore}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Quizzes Scores Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">Quizzes Scores (การทดสอบย่อย)</h3>
                    <span className="text-[10px] text-slate-500">{quizzesColumns.length} assessment quizzes</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {calculation.quizzesScore.toFixed(2)} / {settings.quizzesMaxScore} pts
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                {quizzesColumns.map((col) => {
                  const val = student.quizzesScores[col.id];
                  const pct = val !== null && val !== undefined ? (val / col.maxScore) * 100 : 0;
                  return (
                    <div key={col.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                      <span className="text-slate-600 dark:text-slate-400">{col.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 min-w-[45px] text-right">
                          {val !== null && val !== undefined ? val : '-'} / {col.maxScore}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Participation & Notebook Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300">
                    <BookMarked className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">Participation & Notebook</h3>
                    <span className="text-[10px] text-slate-500">Activities & Homework notebook</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-pink-600 dark:text-pink-400">
                    {(calculation.participationScore + calculation.notebookScore).toFixed(2)} / {(settings.participationMaxScore + settings.notebookMaxScore)} pts
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-fuchsia-50/50 dark:bg-fuchsia-950/20 border border-fuchsia-100 dark:border-fuchsia-900/40">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold text-fuchsia-900 dark:text-fuchsia-300">Participation (การมีส่วนร่วม)</span>
                    <span className="font-bold text-fuchsia-800 dark:text-fuchsia-200">{calculation.participationScore.toFixed(2)} / {settings.participationMaxScore}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-600 dark:text-slate-400">
                    {participationColumns.map(col => (
                      <span key={col.id}>{col.name}: <strong>{student.participationScores[col.id] ?? '-'}</strong>/{col.maxScore}</span>
                    ))}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/40">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold text-pink-900 dark:text-pink-300">Notebook (สมุดงาน)</span>
                    <span className="font-bold text-pink-800 dark:text-pink-200">{calculation.notebookScore.toFixed(2)} / {settings.notebookMaxScore}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-600 dark:text-slate-400">
                    {notebookColumns.map(col => (
                      <span key={col.id}>{col.name}: <strong>{student.notebookScores[col.id] ?? '-'}</strong>/{col.maxScore}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Official Thai Grade Scale Reference */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Thailand Ministry of Education Grading Criteria (เกณฑ์การตัดเกรด)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
            {THAI_GRADE_SCALE.map(tier => {
              const isCurrent = calculation.grade === tier.grade;
              return (
                <div 
                  key={tier.grade} 
                  className={`p-2 rounded-xl border transition-all ${
                    isCurrent 
                      ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 font-bold scale-105 shadow-xs' 
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80'
                  }`}
                >
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-black ${tier.badge}`}>
                    {tier.grade.toFixed(1)}
                  </span>
                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">{tier.thai}</div>
                  <div className="text-[10px] text-slate-400">{tier.min > 0 ? `≥ ${tier.min} pts` : '< 50'}</div>
                  {isCurrent && (
                    <div className="mt-1 text-[9px] bg-indigo-600 text-white rounded font-bold py-0.2">
                      YOUR GRADE
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Security & Privacy Notice */}
        <div className="p-4 rounded-xl bg-slate-200/60 dark:bg-slate-900 border border-slate-300/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Student Privacy & Record Security
            </span>
            <p>
              This portal only displays your individual verified grades and attendance records. Your credentials are authenticated directly against the instructor&apos;s master spreadsheet database. Classmates cannot view your private academic performance.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
