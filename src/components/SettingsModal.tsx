import React, { useState } from 'react';
import { X, Check, Settings as SettingsIcon, Info } from 'lucide-react';
import { ClassSettings } from '../types/classRecord';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ClassSettings;
  onSaveSettings: (settings: ClassSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [form, setForm] = useState<ClassSettings>({ ...settings });

  if (!isOpen) return null;

  const earnedSum =
    form.attendanceMaxScore +
    form.speakingMaxScore +
    form.quizzesMaxScore +
    form.participationMaxScore +
    form.notebookMaxScore;

  const grandSum = form.earnedMaxScore + form.midtermMaxScore + form.finalMaxScore;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold">Class Information & Score Configuration</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          {/* Class details */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] border-b pb-1 border-slate-200 dark:border-slate-800">
              Class & Subject Details
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Subject Code</label>
                <input
                  type="text"
                  value={form.subjectCode}
                  onChange={(e) => setForm({ ...form, subjectCode: e.target.value })}
                  className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Subject Name</label>
                <input
                  type="text"
                  value={form.subjectName}
                  onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
                  className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-semibold"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Class / Section</label>
                <input
                  type="text"
                  value={form.className}
                  onChange={(e) => setForm({ ...form, className: e.target.value })}
                  className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Academic Year</label>
                <input
                  type="text"
                  value={form.academicYear}
                  onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                  className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Semester</label>
                <select
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value })}
                  className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                >
                  <option value="Semester 1">Semester 1 (เทอม 1)</option>
                  <option value="Semester 2">Semester 2 (เทอม 2)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Teacher Name</label>
                <input
                  type="text"
                  value={form.teacherName}
                  onChange={(e) => setForm({ ...form, teacherName: e.target.value })}
                  className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Maximum Points Weights */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-1 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Score Weights & Max Equivalent Points
              </h3>
              <span className="text-[10px] text-slate-500">
                Default: 15 + 15 + 15 + 5 + 10 = 60 earned
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Attendance Max</label>
                <input
                  type="number"
                  value={form.attendanceMaxScore}
                  onChange={(e) => setForm({ ...form, attendanceMaxScore: Number(e.target.value) })}
                  className="w-full p-2 text-center font-bold border rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 border-emerald-300"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Speaking Max</label>
                <input
                  type="number"
                  value={form.speakingMaxScore}
                  onChange={(e) => setForm({ ...form, speakingMaxScore: Number(e.target.value) })}
                  className="w-full p-2 text-center font-bold border rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border-amber-300"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Quizzes Max</label>
                <input
                  type="number"
                  value={form.quizzesMaxScore}
                  onChange={(e) => setForm({ ...form, quizzesMaxScore: Number(e.target.value) })}
                  className="w-full p-2 text-center font-bold border rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 border-indigo-300"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Participation Max</label>
                <input
                  type="number"
                  value={form.participationMaxScore}
                  onChange={(e) => setForm({ ...form, participationMaxScore: Number(e.target.value) })}
                  className="w-full p-2 text-center font-bold border rounded-lg bg-fuchsia-50 dark:bg-fuchsia-950/30 text-fuchsia-900 dark:text-fuchsia-200 border-fuchsia-300"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Notebook Max</label>
                <input
                  type="number"
                  value={form.notebookMaxScore}
                  onChange={(e) => setForm({ ...form, notebookMaxScore: Number(e.target.value) })}
                  className="w-full p-2 text-center font-bold border rounded-lg bg-pink-50 dark:bg-pink-950/30 text-pink-900 dark:text-pink-200 border-pink-300"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Earned Cap Total</label>
                <input
                  type="number"
                  value={form.earnedMaxScore}
                  onChange={(e) => setForm({ ...form, earnedMaxScore: Number(e.target.value) })}
                  className="w-full p-2 text-center font-bold border rounded-lg bg-sky-50 dark:bg-sky-950/30 text-sky-900 dark:text-sky-200 border-sky-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Midterm Exam Max</label>
                <input
                  type="number"
                  value={form.midtermMaxScore}
                  onChange={(e) => setForm({ ...form, midtermMaxScore: Number(e.target.value) })}
                  className="w-full p-2 text-center font-bold border rounded-lg bg-teal-50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200 border-teal-300"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Final Exam Max</label>
                <input
                  type="number"
                  value={form.finalMaxScore}
                  onChange={(e) => setForm({ ...form, finalMaxScore: Number(e.target.value) })}
                  className="w-full p-2 text-center font-bold border rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 border-emerald-300"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-between text-[11px]">
              <span>Formative Sum: <strong>{earnedSum} pts</strong> (Capped at {form.earnedMaxScore})</span>
              <span>Grand Total: <strong>{grandSum} pts</strong></span>
            </div>
          </div>

          {/* Security & Cloud Backend Sync */}
          <div className="space-y-3 p-3.5 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-900">
            <h3 className="font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider text-[11px]">
              🔒 Security & Google Sheets Live Backend
            </h3>
            <div className="space-y-2">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                  Teacher Portal Passcode (PIN)
                </label>
                <input
                  type="text"
                  placeholder="teacher123"
                  value={form.teacherPin || 'teacher123'}
                  onChange={(e) => setForm({ ...form, teacherPin: e.target.value })}
                  className="w-full p-2 rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-mono"
                />
                <span className="text-[10px] text-slate-500">
                  Required to switch from Student Login to Teacher Grading mode.
                </span>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">
                  Google Apps Script Web App URL (Optional Live Sheet Sync)
                </label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={form.googleWebAppUrl || ''}
                  onChange={(e) => setForm({ ...form, googleWebAppUrl: e.target.value })}
                  className="w-full p-2 rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-mono text-xs"
                />
                <span className="text-[10px] text-slate-500">
                  When deployed in Google Sheets (Deploy &gt; Web app), paste URL here to authenticate students directly against your live spreadsheet!
                </span>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="lateHalf"
              checked={form.lateCountsAsHalf}
              onChange={(e) => setForm({ ...form, lateCountsAsHalf: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="lateHalf" className="text-slate-700 dark:text-slate-300 font-medium">
              Count 'L' (Late) as 0.5 attendance point
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
