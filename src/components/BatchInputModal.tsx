import React, { useState } from 'react';
import { X, Check, Users, Sparkles } from 'lucide-react';
import { AttendanceDay, AttendanceRemark, ScoreColumn, Student } from '../types/classRecord';

interface BatchInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  attendanceDays: AttendanceDay[];
  speakingColumns: ScoreColumn[];
  quizzesColumns: ScoreColumn[];
  participationColumns: ScoreColumn[];
  notebookColumns: ScoreColumn[];
  onBatchAttendance: (dayId: string, remark: AttendanceRemark) => void;
  onBatchScore: (category: 'speaking' | 'quizzes' | 'participation' | 'notebook', colId: string, score: number) => void;
  onBatchExam: (type: 'midterm' | 'final', score: number) => void;
}

export const BatchInputModal: React.FC<BatchInputModalProps> = ({
  isOpen,
  onClose,
  students,
  attendanceDays,
  speakingColumns,
  quizzesColumns,
  participationColumns,
  notebookColumns,
  onBatchAttendance,
  onBatchScore,
  onBatchExam,
}) => {
  const [selectedDay, setSelectedDay] = useState<string>(attendanceDays[0]?.id || '');
  const [selectedRemark, setSelectedRemark] = useState<AttendanceRemark>('P');

  const [activeCategory, setActiveCategory] = useState<'speaking' | 'quizzes' | 'participation' | 'notebook' | 'midterm' | 'final'>('speaking');
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [batchScoreValue, setBatchScoreValue] = useState<number>(10);

  if (!isOpen) return null;

  const handleApplyAttendance = () => {
    if (!selectedDay) return;
    onBatchAttendance(selectedDay, selectedRemark);
    alert(`Applied remark "${selectedRemark}" to all ${students.length} students for ${attendanceDays.find(d => d.id === selectedDay)?.name}!`);
  };

  const handleApplyScore = () => {
    if (activeCategory === 'midterm' || activeCategory === 'final') {
      onBatchExam(activeCategory, batchScoreValue);
      alert(`Set ${activeCategory} score to ${batchScoreValue} for all students.`);
      return;
    }

    const colId = selectedColumn || (
      activeCategory === 'speaking' ? speakingColumns[0]?.id :
      activeCategory === 'quizzes' ? quizzesColumns[0]?.id :
      activeCategory === 'participation' ? participationColumns[0]?.id :
      notebookColumns[0]?.id
    );

    if (!colId) return;
    onBatchScore(activeCategory, colId, batchScoreValue);
    alert(`Applied score ${batchScoreValue} to all students for the selected assessment!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-200" />
            <h2 className="text-base font-bold">Quick Batch Entry & Attendance</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-amber-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs">
          {/* 1. Quick Attendance */}
          <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-3">
            <h3 className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>Bulk Attendance Marking (All {students.length} Students)</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Select Day / Session</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full p-2 rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-semibold"
                >
                  {attendanceDays.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} {d.date ? `(${d.date})` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Mark Everyone As</label>
                <select
                  value={selectedRemark}
                  onChange={(e) => setSelectedRemark(e.target.value as AttendanceRemark)}
                  className="w-full p-2 rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-bold"
                >
                  <option value="P">P - Present (มาเรียน)</option>
                  <option value="A">A - Absent (ขาด)</option>
                  <option value="L">L - Late (สาย)</option>
                  <option value="E">E - Excused (ลา)</option>
                  <option value="S">S - Sick (ป่วย)</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleApplyAttendance}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply Remark to Entire Class</span>
            </button>
          </div>

          {/* 2. Quick Preset Scores */}
          <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-3">
            <h3 className="font-bold text-indigo-900 dark:text-indigo-300">
              Bulk Preset Score (Set Default Points)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Category</label>
                <select
                  value={activeCategory}
                  onChange={(e) => {
                    const cat = e.target.value as any;
                    setActiveCategory(cat);
                    setSelectedColumn('');
                  }}
                  className="w-full p-2 rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-semibold"
                >
                  <option value="speaking">Speaking</option>
                  <option value="quizzes">Quizzes</option>
                  <option value="participation">Participation</option>
                  <option value="notebook">Notebook</option>
                  <option value="midterm">Midterm (Max 20)</option>
                  <option value="final">Final (Max 20)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Score to Set</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={batchScoreValue}
                  onChange={(e) => setBatchScoreValue(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-bold text-center"
                />
              </div>
            </div>

            <button
              onClick={handleApplyScore}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Set Score for All Students</span>
            </button>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-lg font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
