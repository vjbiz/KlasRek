import React, { useState, useEffect } from 'react';
import { X, Check, Calculator, UserCheck } from 'lucide-react';
import { AttendanceDay, AttendanceRemark, ClassSettings, ScoreColumn, Student } from '../types/classRecord';
import { calculateGrade, computeStudentCalculation } from '../utils/gradeCalculations';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  editingStudent: Student | null;
  attendanceDays: AttendanceDay[];
  speakingColumns: ScoreColumn[];
  quizzesColumns: ScoreColumn[];
  participationColumns: ScoreColumn[];
  notebookColumns: ScoreColumn[];
  settings: ClassSettings;
  nextNumber: number;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingStudent,
  attendanceDays,
  speakingColumns,
  quizzesColumns,
  participationColumns,
  notebookColumns,
  settings,
  nextNumber,
}) => {
  const [number, setNumber] = useState<number>(nextNumber);
  const [studentNumber, setStudentNumber] = useState<string>('');
  const [thaiName, setThaiName] = useState<string>('');
  const [englishName, setEnglishName] = useState<string>('');
  const [attendance, setAttendance] = useState<Record<string, AttendanceRemark | ''>>({});
  const [speakingScores, setSpeakingScores] = useState<Record<string, number | null>>({});
  const [quizzesScores, setQuizzesScores] = useState<Record<string, number | null>>({});
  const [participationScores, setParticipationScores] = useState<Record<string, number | null>>({});
  const [notebookScores, setNotebookScores] = useState<Record<string, number | null>>({});
  const [midtermScore, setMidtermScore] = useState<number | null>(null);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [password, setPassword] = useState<string>('');

  useEffect(() => {
    if (editingStudent) {
      setNumber(editingStudent.number);
      setStudentNumber(editingStudent.studentNumber);
      setThaiName(editingStudent.thaiName);
      setEnglishName(editingStudent.englishName);
      setAttendance({ ...editingStudent.attendance });
      setSpeakingScores({ ...editingStudent.speakingScores });
      setQuizzesScores({ ...editingStudent.quizzesScores });
      setParticipationScores({ ...editingStudent.participationScores });
      setNotebookScores({ ...editingStudent.notebookScores });
      setMidtermScore(editingStudent.midtermScore);
      setFinalScore(editingStudent.finalScore);
      setPassword(editingStudent.password || `STU-${editingStudent.studentNumber}`);
    } else {
      setNumber(nextNumber);
      const generatedId = `450${String(nextNumber).padStart(2, '0')}`;
      setStudentNumber(generatedId);
      setPassword(`STU-${generatedId}`);
      setThaiName('');
      setEnglishName('');
      // Default attendance to P
      const initialAtt: Record<string, AttendanceRemark> = {};
      attendanceDays.forEach((d) => (initialAtt[d.id] = 'P'));
      setAttendance(initialAtt);

      const spk: Record<string, number | null> = {};
      speakingColumns.forEach((c) => (spk[c.id] = null));
      setSpeakingScores(spk);

      const qz: Record<string, number | null> = {};
      quizzesColumns.forEach((c) => (qz[c.id] = null));
      setQuizzesScores(qz);

      const pt: Record<string, number | null> = {};
      participationColumns.forEach((c) => (pt[c.id] = null));
      setParticipationScores(pt);

      const nb: Record<string, number | null> = {};
      notebookColumns.forEach((c) => (nb[c.id] = null));
      setNotebookScores(nb);

      setMidtermScore(null);
      setFinalScore(null);
    }
  }, [editingStudent, isOpen, nextNumber, attendanceDays]);

  if (!isOpen) return null;

  // Build preview student object for calculation
  const previewStudent: Student = {
    id: editingStudent ? editingStudent.id : 'preview',
    number: Number(number) || 1,
    studentNumber,
    password: password || `STU-${studentNumber}`,
    thaiName: thaiName || 'Student Name',
    englishName: englishName || 'Student Name',
    attendance,
    speakingScores,
    quizzesScores,
    participationScores,
    notebookScores,
    midtermScore,
    finalScore,
  };

  const calc = computeStudentCalculation(
    previewStudent,
    attendanceDays,
    speakingColumns,
    quizzesColumns,
    participationColumns,
    notebookColumns,
    settings
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentNumber.trim() || !thaiName.trim()) {
      alert('Please fill in Student Number and Thai Name');
      return;
    }

    const studentToSave: Student = {
      id: editingStudent ? editingStudent.id : `std_${Date.now()}`,
      number: Number(number),
      studentNumber: studentNumber.trim(),
      password: password.trim() || `STU-${studentNumber.trim()}`,
      thaiName: thaiName.trim(),
      englishName: englishName.trim() || thaiName.trim(),
      attendance,
      speakingScores,
      quizzesScores,
      participationScores,
      notebookScores,
      midtermScore,
      finalScore,
    };

    onSave(studentToSave);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-10 h-10 object-contain rounded-full border border-amber-400 bg-white shadow-xs" 
            />
            <div>
              <h2 className="text-base font-bold">
                {editingStudent ? 'Edit Student Details & Marks' : 'Add New Student Record'}
              </h2>
              <p className="text-xs text-indigo-200">
                {settings.subjectCode} - {settings.className}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
          {/* 1. Basic Student Info */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] border-b pb-1 border-slate-200 dark:border-slate-800">
              1. Basic Information (ข้อมูลพื้นฐาน)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  No. (เลขที่) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={number}
                  onChange={(e) => setNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Student ID (เลขประจำตัว) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 45001"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Thai Name (ชื่อ-สกุล ไทย) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="สมชาย ใจดี"
                  value={thaiName}
                  onChange={(e) => setThaiName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  English Name
                </label>
                <input
                  type="text"
                  placeholder="Somchai Jaidee"
                  value={englishName}
                  onChange={(e) => setEnglishName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Individual Student Password Field */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900">
              <div className="flex-1">
                <label className="block font-bold text-indigo-950 dark:text-indigo-200 mb-1">
                  Individual Student Login Password (รหัสผ่านสำหรับนักเรียน)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. STU-45001"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
                      let code = '';
                      for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
                      setPassword(`STU-${studentNumber || nextNumber}-${code}`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] whitespace-nowrap"
                  >
                    Generate Random
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 sm:max-w-[200px]">
                The student enters this password along with their Student ID to log into their individual grade portal.
              </p>
            </div>
          </div>

          {/* 2. Attendance with remarks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider text-[11px]">
                2. Attendance Days (P, A, L, E, S) — Equiv: {calc.attendanceScore.toFixed(2)} / {settings.attendanceMaxScore}
              </h3>
              <div className="flex gap-2 text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    const allP: Record<string, AttendanceRemark> = {};
                    attendanceDays.forEach((d) => (allP[d.id] = 'P'));
                    setAttendance(allP);
                  }}
                  className="text-emerald-600 hover:underline"
                >
                  All Present
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 p-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900">
              {attendanceDays.map((d) => (
                <div key={d.id} className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{d.name}</span>
                  <select
                    value={attendance[d.id] || ''}
                    onChange={(e) =>
                      setAttendance({
                        ...attendance,
                        [d.id]: e.target.value as AttendanceRemark | '',
                      })
                    }
                    className="mt-0.5 px-1 py-1 text-xs font-bold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="P">P</option>
                    <option value="A">A</option>
                    <option value="L">L</option>
                    <option value="E">E</option>
                    <option value="S">S</option>
                    <option value="">-</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Speaking & Quizzes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Speaking */}
            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-900 dark:text-amber-300">
                  Speaking Scores ({speakingColumns.length} cols)
                </span>
                <span className="font-bold text-amber-800 dark:text-amber-200">
                  Equiv: {calc.speakingScore.toFixed(2)} / {settings.speakingMaxScore}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {speakingColumns.map((col) => (
                  <div key={col.id}>
                    <label className="block text-[10px] text-amber-800 dark:text-amber-400 truncate">
                      {col.name} (/{col.maxScore})
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={col.maxScore}
                      step="0.5"
                      value={speakingScores[col.id] ?? ''}
                      onChange={(e) =>
                        setSpeakingScores({
                          ...speakingScores,
                          [col.id]: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      className="w-full p-1.5 text-center bg-white dark:bg-slate-800 border rounded font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Quizzes */}
            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200 dark:border-indigo-900 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-indigo-900 dark:text-indigo-300">
                  Quizzes Scores ({quizzesColumns.length} cols)
                </span>
                <span className="font-bold text-indigo-800 dark:text-indigo-200">
                  Equiv: {calc.quizzesScore.toFixed(2)} / {settings.quizzesMaxScore}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {quizzesColumns.map((col) => (
                  <div key={col.id}>
                    <label className="block text-[10px] text-indigo-800 dark:text-indigo-400 truncate">
                      {col.name} (/{col.maxScore})
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={col.maxScore}
                      step="0.5"
                      value={quizzesScores[col.id] ?? ''}
                      onChange={(e) =>
                        setQuizzesScores({
                          ...quizzesScores,
                          [col.id]: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      className="w-full p-1.5 text-center bg-white dark:bg-slate-800 border rounded font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Participation & Notebook */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Participation */}
            <div className="p-3 bg-fuchsia-50/50 dark:bg-fuchsia-950/20 rounded-xl border border-fuchsia-200 dark:border-fuchsia-900 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-fuchsia-900 dark:text-fuchsia-300">
                  Participation ({participationColumns.length} cols)
                </span>
                <span className="font-bold text-fuchsia-800 dark:text-fuchsia-200">
                  Equiv: {calc.participationScore.toFixed(2)} / {settings.participationMaxScore}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {participationColumns.map((col) => (
                  <div key={col.id}>
                    <label className="block text-[10px] text-fuchsia-800 dark:text-fuchsia-400 truncate">
                      {col.name} (/{col.maxScore})
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={col.maxScore}
                      step="0.5"
                      value={participationScores[col.id] ?? ''}
                      onChange={(e) =>
                        setParticipationScores({
                          ...participationScores,
                          [col.id]: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      className="w-full p-1.5 text-center bg-white dark:bg-slate-800 border rounded font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Notebook */}
            <div className="p-3 bg-pink-50/50 dark:bg-pink-950/20 rounded-xl border border-pink-200 dark:border-pink-900 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-pink-900 dark:text-pink-300">
                  Notebook ({notebookColumns.length} cols)
                </span>
                <span className="font-bold text-pink-800 dark:text-pink-200">
                  Equiv: {calc.notebookScore.toFixed(2)} / {settings.notebookMaxScore}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {notebookColumns.map((col) => (
                  <div key={col.id}>
                    <label className="block text-[10px] text-pink-800 dark:text-pink-400 truncate">
                      {col.name} (/{col.maxScore})
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={col.maxScore}
                      step="0.5"
                      value={notebookScores[col.id] ?? ''}
                      onChange={(e) =>
                        setNotebookScores({
                          ...notebookScores,
                          [col.id]: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      className="w-full p-1.5 text-center bg-white dark:bg-slate-800 border rounded font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Midterm & Final Exams */}
          <div className="p-3 bg-teal-50/50 dark:bg-teal-950/20 rounded-xl border border-teal-200 dark:border-teal-900 space-y-2">
            <h3 className="font-bold text-teal-900 dark:text-teal-300 uppercase tracking-wider text-[11px]">
              5. Term Examinations (Midterm 20 + Final 20 = 40 max)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-teal-800 dark:text-teal-300 mb-1">
                  Midterm Test Score (Max {settings.midtermMaxScore})
                </label>
                <input
                  type="number"
                  min="0"
                  max={settings.midtermMaxScore}
                  step="0.5"
                  placeholder="e.g. 17"
                  value={midtermScore ?? ''}
                  onChange={(e) => setMidtermScore(e.target.value === '' ? null : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border rounded-lg text-center font-bold text-base text-teal-900 dark:text-teal-200"
                />
              </div>
              <div>
                <label className="block font-medium text-teal-800 dark:text-teal-300 mb-1">
                  Final Test Score (Max {settings.finalMaxScore})
                </label>
                <input
                  type="number"
                  min="0"
                  max={settings.finalMaxScore}
                  step="0.5"
                  placeholder="e.g. 18"
                  value={finalScore ?? ''}
                  onChange={(e) => setFinalScore(e.target.value === '' ? null : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border rounded-lg text-center font-bold text-base text-teal-900 dark:text-teal-200"
                />
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between border border-slate-700">
            <div className="space-y-1">
              <div className="text-xs text-slate-300">
                Earned Scores: <span className="font-bold text-white">{calc.earnedScores.toFixed(2)} / {settings.earnedMaxScore}</span>
              </div>
              <div className="text-xs text-slate-300">
                Midterm & Final: <span className="font-bold text-white">{(calc.midtermScore + calc.finalScore).toFixed(2)} / 40</span>
              </div>
              <div className="text-sm text-yellow-300 font-bold">
                Grand Total Score: {calc.grandTotal.toFixed(2)} / 100
              </div>
            </div>
            <div className="text-center px-4 py-2 bg-white/10 rounded-xl border border-white/20">
              <div className="text-[10px] uppercase font-bold text-slate-300">Equivalency Grade</div>
              <div className="text-3xl font-black text-emerald-400">{calc.grade.toFixed(1)}</div>
              <div className="text-xs text-slate-200">{calc.gradeThaiLabel}</div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-bold text-white shadow-md flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{editingStudent ? 'Save Changes' : 'Add Student'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
