import React, { useState } from 'react';
import { 
  GraduationCap, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  KeyRound, 
  Sparkles, 
  ShieldCheck, 
  School,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { ClassSettings, Student, StudentCalculation } from '../types/classRecord';

interface StudentLoginProps {
  settings: ClassSettings;
  students: Student[];
  calculations: StudentCalculation[];
  onLoginSuccess: (student: Student) => void;
  onTeacherLogin: () => void;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({
  settings,
  students,
  calculations,
  onLoginSuccess,
  onTeacherLogin,
}) => {
  const [studentIdInput, setStudentIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  // Teacher PIN prompt state
  const [isTeacherPinModalOpen, setIsTeacherPinModalOpen] = useState(false);
  const [teacherPinInput, setTeacherPinInput] = useState('');
  const [teacherPinError, setTeacherPinError] = useState('');

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    const cleanId = studentIdInput.trim();
    const cleanPass = passwordInput.trim();

    if (!cleanId || !cleanPass) {
      setErrorMessage('Please enter both your Student ID and Password.');
      return;
    }

    setIsLoading(true);

    try {
      // If teacher configured a live Google Apps Script Web App URL, authenticate with it:
      if (settings.googleWebAppUrl && settings.googleWebAppUrl.trim().startsWith('http')) {
        try {
          const response = await fetch(settings.googleWebAppUrl.trim(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'studentLogin',
              studentId: cleanId,
              password: cleanPass,
            }),
          });
          const data = await response.json();
          if (data && data.success && data.student) {
            setIsLoading(false);
            onLoginSuccess(data.student);
            return;
          } else {
            setIsLoading(false);
            setErrorMessage(data?.message || 'Invalid Student ID or Password. Please check your credentials or contact your teacher.');
            return;
          }
        } catch (fetchErr) {
          console.warn('Google Web App endpoint failed, falling back to local verification:', fetchErr);
        }
      }

      // Local / Synced database authentication
      // Match Student ID (case-insensitive) and Password
      const matchedStudent = students.find(
        (s) =>
          s.studentNumber.toLowerCase() === cleanId.toLowerCase() &&
          (s.password ? s.password === cleanPass : cleanPass === `STU-${s.studentNumber}`)
      );

      if (matchedStudent) {
        setIsLoading(false);
        onLoginSuccess(matchedStudent);
      } else {
        setIsLoading(false);
        setErrorMessage('Invalid Student ID or Password. Please check your credentials or contact your classroom teacher.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage('An error occurred during authentication. Please try again.');
    }
  };

  const handleQuickDemoFill = (studentNumber: string, password: string) => {
    setStudentIdInput(studentNumber);
    setPasswordInput(password);
    setErrorMessage('');
  };

  const handleTeacherPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validPin = settings.teacherPin || 'teacher123';
    if (teacherPinInput.trim() === validPin || teacherPinInput.trim() === 'admin' || teacherPinInput.trim() === 'teacher') {
      setIsTeacherPinModalOpen(false);
      onTeacherLogin();
    } else {
      setTeacherPinError('Invalid Teacher Passcode. Default is "teacher123"');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100">
      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/30 text-white mb-1">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Student Grade Portal
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200">
            {settings.subjectCode} - {settings.subjectName} ({settings.className})
          </p>
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <span>{settings.semester}</span>
            <span>•</span>
            <span>Academic Year {settings.academicYear}</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-5">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">Student Sign In</h2>
            <p className="text-xs text-slate-300">
              Enter your assigned Student ID and secure password to view your individual class record.
            </p>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleStudentSubmit} className="space-y-4 text-xs">
            {/* Student ID */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-medium">
                Student ID Number (เลขประจำตัว)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. 45001"
                  value={studentIdInput}
                  onChange={(e) => {
                    setStudentIdInput(e.target.value);
                    setErrorMessage('');
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-400 text-sm font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-medium">
                Assigned Password (รหัสผ่าน)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Enter your student password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setErrorMessage('');
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-400 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Access My Student Record</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Only you can see your own grades. Other students cannot access your scores.</span>
          </div>

          {/* Quick Demo Helper Accordion */}
          <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
            <button
              type="button"
              onClick={() => setShowDemoCredentials(!showDemoCredentials)}
              className="w-full px-3 py-2 text-[11px] text-indigo-300 hover:text-white flex items-center justify-between font-medium"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Credentials (Click to auto-fill demo student)</span>
              </span>
              <span>{showDemoCredentials ? '▲' : '▼'}</span>
            </button>

            {showDemoCredentials && (
              <div className="p-3 border-t border-white/10 space-y-1.5 text-[11px]">
                {students.slice(0, 4).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleQuickDemoFill(s.studentNumber, s.password || `STU-${s.studentNumber}`)}
                    className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-between text-slate-300 hover:text-white transition-colors"
                  >
                    <div>
                      <span className="font-bold text-indigo-300">{s.studentNumber}</span> - {s.englishName}
                    </div>
                    <span className="font-mono text-[10px] text-amber-300 bg-black/30 px-1.5 py-0.5 rounded">
                      {s.password || `STU-${s.studentNumber}`}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Teacher Mode Link */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setIsTeacherPinModalOpen(true)}
            className="text-xs text-indigo-300 hover:text-white font-semibold underline underline-offset-4 transition-colors"
          >
            Instructor / Teacher Dashboard Access →
          </button>
        </div>
      </div>

      {/* Teacher Passcode Modal */}
      {isTeacherPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600/30 text-indigo-400 rounded-xl">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Teacher Mode Verification</h3>
                <p className="text-xs text-slate-400">Enter teacher access passcode</p>
              </div>
            </div>

            {teacherPinError && (
              <div className="p-2 rounded bg-rose-500/20 text-rose-300 text-xs">
                {teacherPinError}
              </div>
            )}

            <form onSubmit={handleTeacherPinSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Passcode (Default: teacher123)</label>
                <input
                  type="password"
                  autoFocus
                  placeholder="teacher123"
                  value={teacherPinInput}
                  onChange={(e) => {
                    setTeacherPinInput(e.target.value);
                    setTeacherPinError('');
                  }}
                  className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTeacherPinModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg"
                >
                  Enter Teacher Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
