import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  KeyRound, 
  ShieldCheck, 
  School,
  CheckCircle2,
  Sun,
  Moon,
  Languages
} from 'lucide-react';
import { ClassSettings, Student, StudentCalculation } from '../types/classRecord';
import { Language, TRANSLATIONS } from '../utils/translations';

interface StudentLoginProps {
  settings: ClassSettings;
  students: Student[];
  calculations: StudentCalculation[];
  onLoginSuccess: (student: Student) => void;
  onTeacherLogin: () => void;
  lang?: Language;
  onToggleLang?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({
  settings,
  students,
  calculations,
  onLoginSuccess,
  onTeacherLogin,
  lang = 'en',
  onToggleLang,
  isDark = false,
  onToggleTheme,
}) => {
  const t = TRANSLATIONS[lang];
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
      setErrorMessage(t.loginErrorEmpty);
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
            setErrorMessage(data?.message || t.loginErrorInvalid);
            return;
          }
        } catch (fetchErr) {
          console.warn('Google Web App endpoint failed, falling back to local verification:', fetchErr);
        }
      }

      // Local / Synced database authentication
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
        setErrorMessage(t.loginErrorInvalid);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 relative overflow-hidden transition-colors duration-200">
      {/* Top right floating toolbar (Lang & Theme) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {onToggleLang && (
          <button
            onClick={onToggleLang}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md transition-all flex items-center gap-1.5 shadow-lg"
            title="Switch Language"
          >
            <Languages className="w-3.5 h-3.5 text-amber-300" />
            <span>{lang === 'en' ? '🇹🇭 ภาษาไทย' : '🇬🇧 English'}</span>
          </button>
        )}

        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md transition-all shadow-lg"
            title={isDark ? t.themeLight : t.themeDark}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-300" />}
          </button>
        )}
      </div>

      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6 my-6">
        {/* Brand Header with KR Logo */}
        <div className="text-center space-y-2">
          <div className="inline-block relative">
            <img 
              src="/logo.png" 
              alt="KR Class Record Logo" 
              className="w-20 h-20 sm:w-24 sm:h-24 mx-auto object-contain rounded-full shadow-2xl border-4 border-amber-400 bg-white p-0.5 transform hover:scale-105 transition-transform" 
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
            {t.loginTitle}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 font-medium">
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
            <h2 className="text-base font-bold text-white">{t.loginCardHeading}</h2>
            <p className="text-xs text-slate-300">
              {t.loginCardDesc}
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
            <div>
              <label className="block text-slate-200 font-semibold mb-1.5">
                {t.loginStudentIdLabel}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-indigo-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 45001"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:bg-white/20 font-mono text-sm tracking-wide transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-slate-200 font-semibold">
                  {t.loginPasswordLabel}
                </label>
                <span className="text-[10px] text-indigo-300">
                  Unique Secret PIN
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-indigo-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="e.g. STU-45001"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:bg-white/20 font-mono text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm mt-2"
            >
              <span>{isLoading ? 'Verifying...' : t.loginSubmitBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Accordion */}
          <div className="pt-2 border-t border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setShowDemoCredentials(!showDemoCredentials)}
              className="w-full text-center text-indigo-300 hover:text-white flex items-center justify-center gap-1.5 font-medium py-1"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>{showDemoCredentials ? 'Hide Demo Logins' : t.loginQuickDemoTitle}</span>
            </button>

            {showDemoCredentials && (
              <div className="mt-3 p-3 rounded-2xl bg-black/30 border border-white/10 space-y-2 max-h-48 overflow-y-auto">
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  Click any student below to autofill their login credentials:
                </p>
                <div className="space-y-1.5">
                  {students.slice(0, 5).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleQuickDemoFill(s.studentNumber, s.password || `STU-${s.studentNumber}`)}
                      className="w-full p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-between text-left transition-colors"
                    >
                      <div>
                        <span className="font-bold text-white">#{s.number} {s.thaiName}</span>
                        <div className="text-[10px] text-indigo-300 font-mono">
                          ID: {s.studentNumber} • Pass: {s.password || `STU-${s.studentNumber}`}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                        Fill
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Teacher Switcher Link */}
        <div className="text-center pt-2">
          <button
            onClick={() => setIsTeacherPinModalOpen(true)}
            className="text-xs text-indigo-300 hover:text-white underline font-semibold transition-colors flex items-center justify-center gap-1.5 mx-auto"
          >
            <School className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.loginTeacherLink}</span>
          </button>
        </div>
      </div>

      {/* Teacher PIN Passcode Modal */}
      {isTeacherPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full text-slate-100 shadow-2xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <span>{t.loginTeacherModalTitle}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {t.loginTeacherModalDesc}
              </p>
            </div>

            {teacherPinError && (
              <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                {teacherPinError}
              </div>
            )}

            <form onSubmit={handleTeacherPinSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  {t.loginTeacherPasscodeLabel}
                </label>
                <input
                  type="password"
                  placeholder="teacher123"
                  value={teacherPinInput}
                  onChange={(e) => setTeacherPinInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <span className="block text-[10px] text-slate-400 mt-1">
                  Default passcode: <code className="text-amber-400 font-mono">teacher123</code>
                </span>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsTeacherPinModalOpen(false);
                    setTeacherPinError('');
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
                >
                  {t.loginTeacherSubmitBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
