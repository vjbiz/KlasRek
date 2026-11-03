import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  Printer, 
  Copy, 
  Check, 
  RefreshCw, 
  Search, 
  Download,
  ShieldAlert
} from 'lucide-react';
import { ClassSettings, Student } from '../types/classRecord';

interface StudentCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  settings: ClassSettings;
  onUpdatePasswords: (updatedStudents: Student[]) => void;
}

export const StudentCredentialsModal: React.FC<StudentCredentialsModalProps> = ({
  isOpen,
  onClose,
  students,
  settings,
  onUpdatePasswords,
}) => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!isOpen) return null;

  const filtered = students.filter(
    (s) =>
      s.studentNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.thaiName.toLowerCase().includes(search.toLowerCase()) ||
      s.englishName.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopySingle = (student: Student) => {
    const text = `Student: ${student.englishName} (${student.thaiName})\nID: ${student.studentNumber}\nPassword: ${student.password || `STU-${student.studentNumber}`}`;
    navigator.clipboard.writeText(text);
    setCopiedId(student.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const list = students
      .map(
        (s) =>
          `#${s.number} | ID: ${s.studentNumber} | Name: ${s.englishName} (${s.thaiName}) | Password: ${s.password || `STU-${s.studentNumber}`}`
      )
      .join('\n');
    navigator.clipboard.writeText(list);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleRegenerateAll = () => {
    if (!window.confirm('Regenerate unique passwords for all students? This will overwrite existing student passwords.')) {
      return;
    }

    const updated = students.map((s) => {
      // Generate a secure 6-character random alphanumeric password like "9K4M7P" or "STU-XXXXX"
      const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
      let code = '';
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return {
        ...s,
        password: `STU-${s.studentNumber}-${code}`,
      };
    });

    onUpdatePasswords(updated);
  };

  const handlePrintSlips = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-4">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-10 h-10 object-contain rounded-full border border-amber-400 bg-white shadow-xs" 
            />
            <div>
              <h2 className="text-base font-bold">Student Login Credentials & Passwords</h2>
              <p className="text-xs text-indigo-200">
                Manage passwords for individual student portal access ({settings.className})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID or student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'Copied All!' : 'Copy All List'}</span>
            </button>

            <button
              onClick={handleRegenerateAll}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate Unique</span>
            </button>

            <button
              onClick={handlePrintSlips}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Login Slips</span>
            </button>
          </div>
        </div>

        {/* Content Table / Cards */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs flex items-center justify-between group hover:border-indigo-400 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500 text-[10px]">#{s.number}</span>
                    <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-1.5 py-0.2 rounded border border-indigo-200 dark:border-indigo-900">
                      ID: {s.studentNumber}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">{s.thaiName}</div>
                  <div className="text-[11px] text-slate-500">{s.englishName}</div>
                  <div className="pt-1 flex items-center gap-1.5 text-[11px]">
                    <span className="text-slate-400">Password:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-amber-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 select-all">
                      {s.password || `STU-${s.studentNumber}`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleCopySingle(s)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                  title="Copy student credentials"
                >
                  {copiedId === s.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            {students.length} Total students configured with individual passwords
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 dark:bg-slate-700 text-white font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
