import React from 'react';
import { 
  Trophy, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  BarChart2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ClassSettings, StudentCalculation } from '../types/classRecord';
import { THAI_GRADE_SCALE } from '../utils/gradeCalculations';

interface AnalyticsViewProps {
  calculations: StudentCalculation[];
  settings: ClassSettings;
  onEditStudent: (studentId: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  calculations,
  settings,
  onEditStudent,
}) => {
  const total = calculations.length;
  if (total === 0) {
    return <div className="p-8 text-center text-slate-500">No students available for analytics.</div>;
  }

  // Grade Counts
  const gradeCounts: Record<number, number> = {
    4.0: 0, 3.5: 0, 3.0: 0, 2.5: 0, 2.0: 0, 1.5: 0, 1.0: 0, 0.0: 0
  };

  calculations.forEach((c) => {
    gradeCounts[c.grade] = (gradeCounts[c.grade] || 0) + 1;
  });

  // Category Averages
  const avgAttendance = calculations.reduce((acc, c) => acc + c.attendanceScore, 0) / total;
  const avgSpeaking = calculations.reduce((acc, c) => acc + c.speakingScore, 0) / total;
  const avgQuizzes = calculations.reduce((acc, c) => acc + c.quizzesScore, 0) / total;
  const avgParticipation = calculations.reduce((acc, c) => acc + c.participationScore, 0) / total;
  const avgNotebook = calculations.reduce((acc, c) => acc + c.notebookScore, 0) / total;
  const avgEarned = calculations.reduce((acc, c) => acc + c.earnedScores, 0) / total;
  const avgMidterm = calculations.reduce((acc, c) => acc + c.midtermScore, 0) / total;
  const avgFinal = calculations.reduce((acc, c) => acc + c.finalScore, 0) / total;
  const avgGrandTotal = calculations.reduce((acc, c) => acc + c.grandTotal, 0) / total;

  // Top students (Rank 1 to 3)
  const topStudents = [...calculations].sort((a, b) => b.grandTotal - a.grandTotal).slice(0, 3);

  // Students at risk (Grade 0 or < 50)
  const atRiskStudents = calculations.filter((c) => c.grandTotal < 50 || c.grade === 0);

  return (
    <div className="space-y-6">
      {/* Top Stat Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Class Average Grand Total</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {avgGrandTotal.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 100</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Target benchmark: 65.0+</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Formative Earned Average</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {avgEarned.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ {settings.earnedMaxScore}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {((avgEarned / settings.earnedMaxScore) * 100).toFixed(0)}% formative retention
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Midterm & Final Average</div>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
            {(avgMidterm + avgFinal).toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 40</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Mid: {avgMidterm.toFixed(1)}/20 | Fin: {avgFinal.toFixed(1)}/20
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pass / Retention Rate</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {(((total - atRiskStudents.length) / total) * 100).toFixed(0)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {total - atRiskStudents.length} of {total} students passed
          </div>
        </div>
      </div>

      {/* Grade Distribution Chart */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              <span>Official Thai Grade Distribution (การกระจายของเกรด)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Breakdown across the standard 8-tier Ministry of Education 0 to 4.0 grading system
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Total Students: {total}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
          {THAI_GRADE_SCALE.map((tier) => {
            const count = gradeCounts[tier.grade] || 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;

            return (
              <div 
                key={tier.grade} 
                className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/70 flex flex-col items-center text-center relative group hover:border-indigo-400 transition-colors"
              >
                <span className={`text-base font-black px-2.5 py-0.5 rounded-full ${tier.badge}`}>
                  {tier.grade.toFixed(1)}
                </span>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1.5">
                  {tier.thai}
                </span>
                <span className="text-[10px] text-slate-400">
                  {tier.min > 0 ? `≥ ${tier.min} pts` : '< 50 pts'}
                </span>

                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden my-2">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {count} <span className="font-normal text-slate-500 text-[10px]">({percentage.toFixed(0)}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Averages Progress Bars */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          Assessment Category Performance Comparison
        </h3>
        <div className="space-y-3.5 text-xs">
          <div>
            <div className="flex justify-between font-medium mb-1">
              <span className="text-emerald-700 dark:text-emerald-300 font-bold">Attendance (เวลาเรียน)</span>
              <span>{avgAttendance.toFixed(1)} / {settings.attendanceMaxScore} pts ({((avgAttendance / settings.attendanceMaxScore) * 100).toFixed(0)}%)</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(avgAttendance / settings.attendanceMaxScore) * 100}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-medium mb-1">
              <span className="text-amber-700 dark:text-amber-300 font-bold">Speaking (ทักษะพูด)</span>
              <span>{avgSpeaking.toFixed(1)} / {settings.speakingMaxScore} pts ({((avgSpeaking / settings.speakingMaxScore) * 100).toFixed(0)}%)</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(avgSpeaking / settings.speakingMaxScore) * 100}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-medium mb-1">
              <span className="text-indigo-700 dark:text-indigo-300 font-bold">Quizzes (การทดสอบย่อย)</span>
              <span>{avgQuizzes.toFixed(1)} / {settings.quizzesMaxScore} pts ({((avgQuizzes / settings.quizzesMaxScore) * 100).toFixed(0)}%)</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(avgQuizzes / settings.quizzesMaxScore) * 100}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-medium mb-1">
              <span className="text-fuchsia-700 dark:text-fuchsia-300 font-bold">Participation (การมีส่วนร่วม)</span>
              <span>{avgParticipation.toFixed(1)} / {settings.participationMaxScore} pts ({((avgParticipation / settings.participationMaxScore) * 100).toFixed(0)}%)</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-fuchsia-500 h-full rounded-full" style={{ width: `${(avgParticipation / settings.participationMaxScore) * 100}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-medium mb-1">
              <span className="text-pink-700 dark:text-pink-300 font-bold">Notebook (สมุดงาน)</span>
              <span>{avgNotebook.toFixed(1)} / {settings.notebookMaxScore} pts ({((avgNotebook / settings.notebookMaxScore) * 100).toFixed(0)}%)</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-pink-500 h-full rounded-full" style={{ width: `${(avgNotebook / settings.notebookMaxScore) * 100}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-medium mb-1">
              <span className="text-teal-700 dark:text-teal-300 font-bold">Midterm Exam (สอบกลางภาค - Max {settings.midtermMaxScore || 20})</span>
              <span>{avgMidterm.toFixed(1)} / {settings.midtermMaxScore || 20} pts ({(((avgMidterm) / (settings.midtermMaxScore || 20)) * 100).toFixed(0)}%)</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-teal-500 h-full rounded-full" style={{ width: `${((avgMidterm) / (settings.midtermMaxScore || 20)) * 100}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-medium mb-1">
              <span className="text-emerald-700 dark:text-emerald-300 font-bold">Final Exam (สอบปลายภาค - Max {settings.finalMaxScore || 20})</span>
              <span>{avgFinal.toFixed(1)} / {settings.finalMaxScore || 20} pts ({(((avgFinal) / (settings.finalMaxScore || 20)) * 100).toFixed(0)}%)</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${((avgFinal) / (settings.finalMaxScore || 20)) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Top Performers & Students Needing Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Honor Roll */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Top Performing Students</span>
          </h3>
          <div className="space-y-2.5">
            {topStudents.map((calc, i) => (
              <div key={calc.student.id} className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${i === 0 ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-white'}`}>
                    {i + 1}
                  </span>
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{calc.student.thaiName}</div>
                    <div className="text-[11px] text-slate-500">{calc.student.englishName} (#{calc.student.number})</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-sm text-amber-700 dark:text-amber-400">{calc.grandTotal.toFixed(1)}</div>
                  <div className="text-[10px] font-bold text-emerald-600">Grade {calc.grade.toFixed(1)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* At Risk Students */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>Students Needing Remedial / Support (&lt; 50 pts)</span>
          </h3>
          {atRiskStudents.length === 0 ? (
            <div className="p-6 text-center text-emerald-600 dark:text-emerald-400 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
              🎉 Great news! All students have achieved passing scores (≥ 50 points).
            </div>
          ) : (
            <div className="space-y-2.5">
              {atRiskStudents.map((calc) => (
                <div key={calc.student.id} className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
                  <div>
                    <div className="font-bold text-xs text-rose-900 dark:text-rose-200">{calc.student.thaiName}</div>
                    <div className="text-[11px] text-slate-500">{calc.student.englishName} (#{calc.student.number})</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-black text-sm text-rose-700 dark:text-rose-400">{calc.grandTotal.toFixed(1)}</div>
                      <div className="text-[10px] font-bold text-rose-600">Grade 0.0 (Fail)</div>
                    </div>
                    <button
                      onClick={() => onEditStudent(calc.student.id)}
                      className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-white dark:hover:bg-slate-800"
                      title="Adjust student marks"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
