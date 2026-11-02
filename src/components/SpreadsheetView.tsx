import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  HelpCircle,
  Filter,
  ArrowUpDown,
  Calendar,
  Sparkles
} from 'lucide-react';
import { 
  AttendanceDay, 
  AttendanceRemark, 
  ClassSettings, 
  ScoreColumn, 
  Student, 
  StudentCalculation 
} from '../types/classRecord';
import { REMARKS_INFO } from '../utils/gradeCalculations';

interface SpreadsheetViewProps {
  students: Student[];
  calculations: StudentCalculation[];
  attendanceDays: AttendanceDay[];
  speakingColumns: ScoreColumn[];
  quizzesColumns: ScoreColumn[];
  participationColumns: ScoreColumn[];
  notebookColumns: ScoreColumn[];
  settings: ClassSettings;
  
  onUpdateAttendance: (studentId: string, dayId: string, remark: AttendanceRemark | '') => void;
  onUpdateScore: (studentId: string, category: 'speaking' | 'quizzes' | 'participation' | 'notebook', colId: string, val: number | null) => void;
  onUpdateExam: (studentId: string, type: 'midterm' | 'final', val: number | null) => void;
  onAddAttendanceDay: () => void;
  onRemoveAttendanceDay: (dayId: string) => void;
  onAddColumn: (category: 'speaking' | 'quizzes' | 'participation' | 'notebook') => void;
  onRemoveColumn: (category: 'speaking' | 'quizzes' | 'participation' | 'notebook', colId: string) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onAddStudent: () => void;
}

export const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({
  students,
  calculations,
  attendanceDays,
  speakingColumns,
  quizzesColumns,
  participationColumns,
  notebookColumns,
  settings,
  onUpdateAttendance,
  onUpdateScore,
  onUpdateExam,
  onAddAttendanceDay,
  onRemoveAttendanceDay,
  onAddColumn,
  onRemoveColumn,
  onEditStudent,
  onDeleteStudent,
  onAddStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'number' | 'grandTotal' | 'name' | 'rank'>('number');
  const [sortAsc, setSortAsc] = useState(true);

  // Cycle through remarks when clicking attendance cell
  const handleAttendanceClick = (studentId: string, currentRemark: AttendanceRemark | '') => {
    const cycle: (AttendanceRemark | '')[] = ['', 'P', 'A', 'L', 'E', 'S'];
    const idx = cycle.indexOf(currentRemark);
    const nextRemark = cycle[(idx + 1) % cycle.length];
    onUpdateAttendance(studentId, attendanceDays[0]?.id || '', nextRemark);
  };

  const handleCellAttendanceClick = (studentId: string, dayId: string, currentRemark: AttendanceRemark | '') => {
    const cycle: (AttendanceRemark | '')[] = ['', 'P', 'A', 'L', 'E', 'S'];
    const idx = cycle.indexOf(currentRemark || '');
    const nextRemark = cycle[(idx + 1) % cycle.length];
    onUpdateAttendance(studentId, dayId, nextRemark);
  };

  // Filter & sort calculations
  const filteredCalculations = calculations.filter((calc) => {
    const query = searchQuery.toLowerCase().trim();
    const matchSearch =
      query === '' ||
      calc.student.studentNumber.toLowerCase().includes(query) ||
      calc.student.thaiName.toLowerCase().includes(query) ||
      calc.student.englishName.toLowerCase().includes(query) ||
      String(calc.student.number).includes(query);

    const matchGrade =
      gradeFilter === 'all' ||
      (gradeFilter === 'pass' && calc.isPassed) ||
      (gradeFilter === 'fail' && !calc.isPassed) ||
      calc.grade === Number(gradeFilter);

    return matchSearch && matchGrade;
  }).sort((a, b) => {
    let cmp = 0;
    if (sortField === 'number') cmp = a.student.number - b.student.number;
    else if (sortField === 'grandTotal') cmp = b.grandTotal - a.grandTotal;
    else if (sortField === 'name') cmp = a.student.englishName.localeCompare(b.student.englishName);
    else if (sortField === 'rank') cmp = (a.rank || 0) - (b.rank || 0);

    return sortAsc ? cmp : -cmp;
  });

  const toggleSort = (field: 'number' | 'grandTotal' | 'name' | 'rank') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'number' || field === 'rank');
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Bar: Search, Filters, Column Counters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, Thai or English name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Grade Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="text-xs py-1.5 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Grades (0 - 4.0)</option>
              <option value="pass">Passed (≥ 1.0)</option>
              <option value="fail">Failed (Grade 0)</option>
              <option value="4">Grade 4.0 (80-100)</option>
              <option value="3.5">Grade 3.5 (75-79)</option>
              <option value="3">Grade 3.0 (70-74)</option>
              <option value="2.5">Grade 2.5 (65-69)</option>
              <option value="2">Grade 2.0 (60-64)</option>
              <option value="1.5">Grade 1.5 (55-59)</option>
              <option value="1">Grade 1.0 (50-54)</option>
              <option value="0">Grade 0.0 (&lt; 50)</option>
            </select>
          </div>

          {/* Sort pills */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => toggleSort('number')}
              className={`px-2 py-1 rounded border transition-colors ${
                sortField === 'number'
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              No. {sortField === 'number' && (sortAsc ? '↑' : '↓')}
            </button>
            <button
              onClick={() => toggleSort('grandTotal')}
              className={`px-2 py-1 rounded border transition-colors ${
                sortField === 'grandTotal'
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              Score {sortField === 'grandTotal' && (sortAsc ? '↑' : '↓')}
            </button>
            <button
              onClick={() => toggleSort('rank')}
              className={`px-2 py-1 rounded border transition-colors ${
                sortField === 'rank'
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              Rank {sortField === 'rank' && (sortAsc ? '↑' : '↓')}
            </button>
          </div>
        </div>

        {/* Legend / Quick Guide */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
          <span className="font-medium text-slate-500">Remarks:</span>
          <span className="px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">P = Present</span>
          <span className="px-1.5 py-0.5 rounded font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300">A = Absent</span>
          <span className="px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">L = Late</span>
          <span className="px-1.5 py-0.5 rounded font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300">E = Excused</span>
          <span className="px-1.5 py-0.5 rounded font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300">S = Sick</span>
        </div>
      </div>

      {/* Main Spreadsheet Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh] relative select-none">
          <table className="w-full text-xs border-collapse text-left">
            {/* Header Tier 1: Group Headers */}
            <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800">
              <tr className="border-b border-slate-300 dark:border-slate-700 font-bold text-center">
                {/* Fixed student identification */}
                <th colSpan={4} className="p-2.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-left border-r border-slate-300 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span>STUDENT DETAILS (ข้อมูลนักเรียน)</span>
                    <button
                      onClick={onAddStudent}
                      className="p-1 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-950 rounded"
                      title="Add New Student"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>

                {/* Attendance Group */}
                <th colSpan={attendanceDays.length + 2} className="p-2 bg-emerald-600 text-white border-r border-emerald-700">
                  <div className="flex items-center justify-between px-2">
                    <span className="tracking-wide">ATTENDANCE (เวลาเรียน - P, A, L, E, S)</span>
                    <button
                      onClick={onAddAttendanceDay}
                      className="px-2 py-0.5 text-[10px] bg-emerald-700 hover:bg-emerald-800 text-white rounded font-medium flex items-center gap-1"
                      title="Add Session/Day Column"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Day</span>
                    </button>
                  </div>
                </th>

                {/* Speaking Scores Group (15 max) */}
                <th colSpan={speakingColumns.length + 1} className="p-2 bg-amber-600 text-white border-r border-amber-700">
                  <div className="flex items-center justify-between px-2">
                    <span className="tracking-wide">SPEAKING SCORES (ทักษะพูด - Max {settings.speakingMaxScore})</span>
                    <button
                      onClick={() => onAddColumn('speaking')}
                      className="px-2 py-0.5 text-[10px] bg-amber-700 hover:bg-amber-800 text-white rounded font-medium flex items-center gap-1"
                      title="Add Speaking Column"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Col</span>
                    </button>
                  </div>
                </th>

                {/* Quizzes Scores Group (15 max) */}
                <th colSpan={quizzesColumns.length + 1} className="p-2 bg-indigo-600 text-white border-r border-indigo-700">
                  <div className="flex items-center justify-between px-2">
                    <span className="tracking-wide">QUIZZES (ทดสอบย่อย - Max {settings.quizzesMaxScore})</span>
                    <button
                      onClick={() => onAddColumn('quizzes')}
                      className="px-2 py-0.5 text-[10px] bg-indigo-700 hover:bg-indigo-800 text-white rounded font-medium flex items-center gap-1"
                      title="Add Quiz Column"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Col</span>
                    </button>
                  </div>
                </th>

                {/* Participation Scores Group */}
                <th colSpan={participationColumns.length + 1} className="p-2 bg-fuchsia-600 text-white border-r border-fuchsia-700">
                  <div className="flex items-center justify-between px-2">
                    <span className="tracking-wide">PARTICIPATION (มีส่วนร่วม - Max {settings.participationMaxScore})</span>
                    <button
                      onClick={() => onAddColumn('participation')}
                      className="px-2 py-0.5 text-[10px] bg-fuchsia-700 hover:bg-fuchsia-800 text-white rounded font-medium flex items-center gap-1"
                      title="Add Participation Column"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Col</span>
                    </button>
                  </div>
                </th>

                {/* Notebook Scores Group (10 max) */}
                <th colSpan={notebookColumns.length + 1} className="p-2 bg-pink-600 text-white border-r border-pink-700">
                  <div className="flex items-center justify-between px-2">
                    <span className="tracking-wide">NOTEBOOK (สมุด - Max {settings.notebookMaxScore})</span>
                    <button
                      onClick={() => onAddColumn('notebook')}
                      className="px-2 py-0.5 text-[10px] bg-pink-700 hover:bg-pink-800 text-white rounded font-medium flex items-center gap-1"
                      title="Add Notebook Column"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Col</span>
                    </button>
                  </div>
                </th>

                {/* Earned Score Summary (60 max) */}
                <th rowSpan={2} className="p-2 bg-sky-700 text-white border-r border-sky-800 text-center min-w-[75px] align-middle">
                  <div className="font-bold">EARNED</div>
                  <div className="text-[10px] text-sky-200">Max {settings.earnedMaxScore}</div>
                </th>

                {/* Midterm (20 max) */}
                <th rowSpan={2} className="p-2 bg-teal-700 text-white border-r border-teal-800 text-center min-w-[65px] align-middle">
                  <div className="font-bold">MIDTERM</div>
                  <div className="text-[10px] text-teal-200">Max {settings.midtermMaxScore}</div>
                </th>

                {/* Final (20 max) */}
                <th rowSpan={2} className="p-2 bg-emerald-800 text-white border-r border-emerald-900 text-center min-w-[65px] align-middle">
                  <div className="font-bold">FINAL</div>
                  <div className="text-[10px] text-emerald-200">Max {settings.finalMaxScore}</div>
                </th>

                {/* Grand Total Score (100 max) */}
                <th rowSpan={2} className="p-2 bg-slate-900 text-white border-r border-slate-950 text-center min-w-[80px] align-middle">
                  <div className="font-bold">GRAND TOTAL</div>
                  <div className="text-[10px] text-amber-300">Max 100</div>
                </th>

                {/* Thai Grade Equivalency (0 - 4.0) */}
                <th rowSpan={2} className="p-2 bg-orange-600 text-white border-r border-orange-700 text-center min-w-[85px] align-middle">
                  <div className="font-bold">GRADE</div>
                  <div className="text-[10px] text-orange-200">Scale 0 - 4.0</div>
                </th>

                {/* Status & Actions */}
                <th rowSpan={2} className="p-2 bg-slate-800 text-white text-center min-w-[80px] align-middle">
                  ACTIONS
                </th>
              </tr>

              {/* Header Tier 2: Sub-columns */}
              <tr className="border-b border-slate-300 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 text-center">
                {/* Student info sub-headers */}
                <th className="p-2 w-10 text-center border-r border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">#</th>
                <th className="p-2 w-20 text-left border-r border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">Student ID</th>
                <th className="p-2 min-w-[150px] text-left border-r border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">Thai Name</th>
                <th className="p-2 min-w-[150px] text-left border-r border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">English Name</th>

                {/* Attendance days */}
                {attendanceDays.map((day, idx) => (
                  <th key={day.id} className="p-1.5 w-9 text-center bg-emerald-50 dark:bg-emerald-950/40 border-r border-emerald-200 dark:border-emerald-900 group">
                    <div className="relative">
                      <span>{day.name}</span>
                      {attendanceDays.length > 5 && (
                        <button
                          onClick={() => onRemoveAttendanceDay(day.id)}
                          className="hidden group-hover:block absolute -top-1 right-0 text-rose-500 hover:text-rose-700"
                          title="Remove day column"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                {/* Attendance Summaries */}
                <th className="p-1.5 w-14 text-center bg-emerald-100 dark:bg-emerald-900/60 font-bold text-emerald-900 dark:text-emerald-200 border-r border-emerald-300">
                  Total P
                </th>
                <th className="p-1.5 w-16 text-center bg-emerald-200 dark:bg-emerald-800/80 font-extrabold text-emerald-950 dark:text-emerald-100 border-r border-emerald-400">
                  Att. (/{settings.attendanceMaxScore})
                </th>

                {/* Speaking Columns */}
                {speakingColumns.map((col) => (
                  <th key={col.id} className="p-1.5 w-16 text-center bg-amber-50 dark:bg-amber-950/40 border-r border-amber-200 dark:border-amber-900 group">
                    <div className="flex flex-col items-center">
                      <span className="truncate max-w-[60px]">{col.name}</span>
                      <span className="text-[9px] text-amber-700 dark:text-amber-300">/{col.maxScore}</span>
                      {speakingColumns.length > 1 && (
                        <button
                          onClick={() => onRemoveColumn('speaking', col.id)}
                          className="hidden group-hover:inline text-[10px] text-rose-500 hover:underline"
                        >
                          rem
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                <th className="p-1.5 w-16 text-center bg-amber-200 dark:bg-amber-800/80 font-extrabold text-amber-950 dark:text-amber-100 border-r border-amber-400">
                  Spk (/{settings.speakingMaxScore})
                </th>

                {/* Quizzes Columns */}
                {quizzesColumns.map((col) => (
                  <th key={col.id} className="p-1.5 w-16 text-center bg-indigo-50 dark:bg-indigo-950/40 border-r border-indigo-200 dark:border-indigo-900 group">
                    <div className="flex flex-col items-center">
                      <span className="truncate max-w-[60px]">{col.name}</span>
                      <span className="text-[9px] text-indigo-700 dark:text-indigo-300">/{col.maxScore}</span>
                      {quizzesColumns.length > 1 && (
                        <button
                          onClick={() => onRemoveColumn('quizzes', col.id)}
                          className="hidden group-hover:inline text-[10px] text-rose-500 hover:underline"
                        >
                          rem
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                <th className="p-1.5 w-16 text-center bg-indigo-200 dark:bg-indigo-800/80 font-extrabold text-indigo-950 dark:text-indigo-100 border-r border-indigo-400">
                  Quiz (/{settings.quizzesMaxScore})
                </th>

                {/* Participation Columns */}
                {participationColumns.map((col) => (
                  <th key={col.id} className="p-1.5 w-16 text-center bg-fuchsia-50 dark:bg-fuchsia-950/40 border-r border-fuchsia-200 dark:border-fuchsia-900 group">
                    <div className="flex flex-col items-center">
                      <span className="truncate max-w-[60px]">{col.name}</span>
                      <span className="text-[9px] text-fuchsia-700 dark:text-fuchsia-300">/{col.maxScore}</span>
                    </div>
                  </th>
                ))}
                <th className="p-1.5 w-16 text-center bg-fuchsia-200 dark:bg-fuchsia-800/80 font-extrabold text-fuchsia-950 dark:text-fuchsia-100 border-r border-fuchsia-400">
                  Part (/{settings.participationMaxScore})
                </th>

                {/* Notebook Columns */}
                {notebookColumns.map((col) => (
                  <th key={col.id} className="p-1.5 w-16 text-center bg-pink-50 dark:bg-pink-950/40 border-r border-pink-200 dark:border-pink-900 group">
                    <div className="flex flex-col items-center">
                      <span className="truncate max-w-[60px]">{col.name}</span>
                      <span className="text-[9px] text-pink-700 dark:text-pink-300">/{col.maxScore}</span>
                    </div>
                  </th>
                ))}
                <th className="p-1.5 w-16 text-center bg-pink-200 dark:bg-pink-800/80 font-extrabold text-pink-950 dark:text-pink-100 border-r border-pink-400">
                  NB (/{settings.notebookMaxScore})
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {filteredCalculations.length === 0 ? (
                <tr>
                  <td colSpan={30} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No students match your search or filter.
                  </td>
                </tr>
              ) : (
                filteredCalculations.map((calc, rowIndex) => {
                  const s = calc.student;
                  const isEven = rowIndex % 2 === 0;

                  return (
                    <tr 
                      key={s.id} 
                      className={`hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors ${
                        isEven ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/30'
                      }`}
                    >
                      {/* 1. Student No */}
                      <td className="p-2 text-center font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">
                        {s.number}
                      </td>

                      {/* 2. Student ID */}
                      <td className="p-2 font-mono text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800">
                        {s.studentNumber}
                      </td>

                      {/* 3. Thai Name */}
                      <td className="p-2 font-medium text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                        {s.thaiName}
                      </td>

                      {/* 4. English Name & Password */}
                      <td className="p-2 text-slate-700 dark:text-slate-300 border-r border-slate-300 dark:border-slate-700 whitespace-nowrap">
                        <div className="flex items-center justify-between gap-2">
                          <span>{s.englishName}</span>
                          <span 
                            className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700" 
                            title="Assigned Student Login Password"
                          >
                            🔑 {s.password || `STU-${s.studentNumber}`}
                          </span>
                        </div>
                      </td>

                      {/* Attendance Days */}
                      {attendanceDays.map((day) => {
                        const rem = s.attendance[day.id] || '';
                        const remInfo = rem ? REMARKS_INFO[rem] : null;

                        return (
                          <td 
                            key={day.id} 
                            onClick={() => handleCellAttendanceClick(s.id, day.id, rem)}
                            className="p-1 text-center border-r border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-emerald-100/60 dark:hover:bg-emerald-950/60 transition-colors"
                            title="Click to cycle: P (Present) -> A (Absent) -> L (Late) -> E (Excused) -> S (Sick)"
                          >
                            {rem ? (
                              <span className={`inline-block w-6 h-6 leading-6 rounded-md font-bold text-xs border ${remInfo?.badgeBg}`}>
                                {rem}
                              </span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600 font-mono">-</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Summary Attendance Scores */}
                      {/* Total Presences */}
                      <td className="p-2 text-center font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20 border-r border-emerald-200 dark:border-emerald-900">
                        {calc.presencesCount}
                        {calc.latesCount > 0 && settings.lateCountsAsHalf && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 ml-0.5" title={`${calc.latesCount} lates (+${calc.latesCount * 0.5} pts)`}>
                            *
                          </span>
                        )}
                      </td>
                      {/* Attendance Equivalent Score (15 Max) */}
                      <td className="p-2 text-center font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100/40 dark:bg-emerald-900/30 border-r border-emerald-300 dark:border-emerald-800">
                        {calc.attendanceScore.toFixed(2)}
                      </td>

                      {/* Speaking Columns Input */}
                      {speakingColumns.map((col) => {
                        const val = s.speakingScores[col.id];
                        return (
                          <td key={col.id} className="p-1 text-center border-r border-slate-200 dark:border-slate-800">
                            <input
                              type="number"
                              min="0"
                              max={col.maxScore}
                              step="0.5"
                              value={val !== null && val !== undefined ? val : ''}
                              onChange={(e) => {
                                const parsed = e.target.value === '' ? null : Number(e.target.value);
                                onUpdateScore(s.id, 'speaking', col.id, parsed);
                              }}
                              className="w-12 py-1 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-amber-500 focus:outline-hidden font-medium"
                              placeholder="-"
                            />
                          </td>
                        );
                      })}
                      {/* Speaking Equivalent Score (15 Max) */}
                      <td className="p-2 text-center font-black text-amber-800 dark:text-amber-300 bg-amber-100/40 dark:bg-amber-900/30 border-r border-amber-300 dark:border-amber-800">
                        {calc.speakingScore.toFixed(2)}
                      </td>

                      {/* Quizzes Columns Input */}
                      {quizzesColumns.map((col) => {
                        const val = s.quizzesScores[col.id];
                        return (
                          <td key={col.id} className="p-1 text-center border-r border-slate-200 dark:border-slate-800">
                            <input
                              type="number"
                              min="0"
                              max={col.maxScore}
                              step="0.5"
                              value={val !== null && val !== undefined ? val : ''}
                              onChange={(e) => {
                                const parsed = e.target.value === '' ? null : Number(e.target.value);
                                onUpdateScore(s.id, 'quizzes', col.id, parsed);
                              }}
                              className="w-12 py-1 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-medium"
                              placeholder="-"
                            />
                          </td>
                        );
                      })}
                      {/* Quizzes Equivalent Score (15 Max) */}
                      <td className="p-2 text-center font-black text-indigo-800 dark:text-indigo-300 bg-indigo-100/40 dark:bg-indigo-900/30 border-r border-indigo-300 dark:border-indigo-800">
                        {calc.quizzesScore.toFixed(2)}
                      </td>

                      {/* Participation Columns Input */}
                      {participationColumns.map((col) => {
                        const val = s.participationScores[col.id];
                        return (
                          <td key={col.id} className="p-1 text-center border-r border-slate-200 dark:border-slate-800">
                            <input
                              type="number"
                              min="0"
                              max={col.maxScore}
                              step="0.5"
                              value={val !== null && val !== undefined ? val : ''}
                              onChange={(e) => {
                                const parsed = e.target.value === '' ? null : Number(e.target.value);
                                onUpdateScore(s.id, 'participation', col.id, parsed);
                              }}
                              className="w-12 py-1 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-fuchsia-500 focus:outline-hidden font-medium"
                              placeholder="-"
                            />
                          </td>
                        );
                      })}
                      {/* Participation Equivalent Score */}
                      <td className="p-2 text-center font-black text-fuchsia-800 dark:text-fuchsia-300 bg-fuchsia-100/40 dark:bg-fuchsia-900/30 border-r border-fuchsia-300 dark:border-fuchsia-800">
                        {calc.participationScore.toFixed(2)}
                      </td>

                      {/* Notebook Columns Input */}
                      {notebookColumns.map((col) => {
                        const val = s.notebookScores[col.id];
                        return (
                          <td key={col.id} className="p-1 text-center border-r border-slate-200 dark:border-slate-800">
                            <input
                              type="number"
                              min="0"
                              max={col.maxScore}
                              step="0.5"
                              value={val !== null && val !== undefined ? val : ''}
                              onChange={(e) => {
                                const parsed = e.target.value === '' ? null : Number(e.target.value);
                                onUpdateScore(s.id, 'notebook', col.id, parsed);
                              }}
                              className="w-12 py-1 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-pink-500 focus:outline-hidden font-medium"
                              placeholder="-"
                            />
                          </td>
                        );
                      })}
                      {/* Notebook Equivalent Score (10 Max) */}
                      <td className="p-2 text-center font-black text-pink-800 dark:text-pink-300 bg-pink-100/40 dark:bg-pink-900/30 border-r border-pink-300 dark:border-pink-800">
                        {calc.notebookScore.toFixed(2)}
                      </td>

                      {/* Summary of Earned Scores (Max 60) */}
                      <td 
                        className="p-2 text-center font-black text-sm text-sky-900 dark:text-sky-200 bg-sky-100/50 dark:bg-sky-950/40 border-r border-sky-300 dark:border-sky-800"
                        title={`Att: ${calc.attendanceScore} + Spk: ${calc.speakingScore} + Quiz: ${calc.quizzesScore} + Part: ${calc.participationScore} + NB: ${calc.notebookScore} = ${calc.earnedScores} / 60`}
                      >
                        {calc.earnedScores.toFixed(2)}
                      </td>

                      {/* Midterm Test Score (Max 20) */}
                      <td className="p-1.5 text-center border-r border-teal-200 dark:border-teal-900 bg-teal-50/30 dark:bg-teal-950/20">
                        <input
                          type="number"
                          min="0"
                          max={settings.midtermMaxScore}
                          step="0.5"
                          value={s.midtermScore !== null && s.midtermScore !== undefined ? s.midtermScore : ''}
                          onChange={(e) => {
                            const parsed = e.target.value === '' ? null : Number(e.target.value);
                            onUpdateExam(s.id, 'midterm', parsed);
                          }}
                          className="w-14 py-1 text-center font-bold bg-white dark:bg-slate-800 border border-teal-300 dark:border-teal-700 rounded text-teal-900 dark:text-teal-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                          placeholder="/20"
                        />
                      </td>

                      {/* Final Test Score (Max 20) */}
                      <td className="p-1.5 text-center border-r border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/20">
                        <input
                          type="number"
                          min="0"
                          max={settings.finalMaxScore}
                          step="0.5"
                          value={s.finalScore !== null && s.finalScore !== undefined ? s.finalScore : ''}
                          onChange={(e) => {
                            const parsed = e.target.value === '' ? null : Number(e.target.value);
                            onUpdateExam(s.id, 'final', parsed);
                          }}
                          className="w-14 py-1 text-center font-bold bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded text-emerald-900 dark:text-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                          placeholder="/20"
                        />
                      </td>

                      {/* Grand Total Score (Max 100) */}
                      <td className="p-2 text-center font-black text-base text-slate-900 dark:text-white bg-slate-100/70 dark:bg-slate-800/80 border-r border-slate-300 dark:border-slate-700">
                        <span className={calc.grandTotal >= 80 ? 'text-emerald-600 dark:text-emerald-400' : calc.grandTotal >= 50 ? 'text-slate-800 dark:text-slate-200' : 'text-rose-600 dark:text-rose-400'}>
                          {calc.grandTotal.toFixed(2)}
                        </span>
                      </td>

                      {/* Equivalency Grade (Thai Scale 0 - 4.0) */}
                      <td className="p-2 text-center border-r border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col items-center justify-center">
                          <span className={`px-2.5 py-0.5 rounded-full font-black text-xs border shadow-2xs ${calc.gradeColor}`}>
                            {calc.grade.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {calc.gradeThaiLabel}
                          </span>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditStudent(s)}
                            className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded transition-colors"
                            title="Edit Student Info"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteStudent(s.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
