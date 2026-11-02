import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cloud, 
  CloudUpload, 
  CloudDownload, 
  Database, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  saveClassToFirestore, 
  loadClassFromFirestore, 
  listTeacherClasses, 
  SavedClassSummary,
  testConnection 
} from '../services/firestoreService';
import { 
  googleSignIn, 
  logout 
} from '../services/googleAuth';
import { 
  ClassSettings, 
  AttendanceDay, 
  ScoreColumn, 
  Student 
} from '../types/classRecord';

interface FirebaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onAuthChange: (user: User | null) => void;
  settings: ClassSettings;
  attendanceDays: AttendanceDay[];
  speakingColumns: ScoreColumn[];
  quizzesColumns: ScoreColumn[];
  participationColumns: ScoreColumn[];
  notebookColumns: ScoreColumn[];
  students: Student[];
  onLoadClass: (data: {
    settings: Partial<ClassSettings>;
    attendanceDays: AttendanceDay[];
    speakingColumns: ScoreColumn[];
    quizzesColumns: ScoreColumn[];
    participationColumns: ScoreColumn[];
    notebookColumns: ScoreColumn[];
    students: Student[];
  }) => void;
}

export const FirebaseModal: React.FC<FirebaseModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthChange,
  settings,
  attendanceDays,
  speakingColumns,
  quizzesColumns,
  participationColumns,
  notebookColumns,
  students,
  onLoadClass,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [savedClasses, setSavedClasses] = useState<SavedClassSummary[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmOverwriteClassId, setConfirmOverwriteClassId] = useState<string | null>(null);

  // Generate a standard class ID from subject and class
  const classId = `class_${(settings.subjectCode || 'ENG').replace(/[^a-zA-Z0-9]/g, '_')}_${(settings.className || '101').replace(/[^a-zA-Z0-9]/g, '_')}`.toLowerCase();

  const fetchClasses = async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      const classes = await listTeacherClasses();
      setSavedClasses(classes);
    } catch (err: any) {
      console.error('Failed to list classes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchClasses();
      testConnection();
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setStatusMessage(null);
      const result = await googleSignIn();
      if (result) {
        onAuthChange(result.user);
        setStatusMessage({ type: 'success', text: `Signed in as ${result.user.email}` });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Sign in failed.' });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSaveCurrentClass = async () => {
    try {
      setIsLoading(true);
      setStatusMessage(null);
      await saveClassToFirestore(
        classId,
        settings,
        attendanceDays,
        speakingColumns,
        quizzesColumns,
        participationColumns,
        notebookColumns,
        students
      );
      setStatusMessage({
        type: 'success',
        text: `✅ Saved "${settings.subjectCode} - ${settings.className}" with ${students.length} students to Cloud Firestore!`,
      });
      await fetchClasses();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save to Firestore.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmLoad = async (targetClassId: string) => {
    try {
      setIsLoading(true);
      setStatusMessage(null);
      const loaded = await loadClassFromFirestore(targetClassId);
      if (loaded) {
        onLoadClass(loaded);
        setStatusMessage({
          type: 'success',
          text: `✅ Loaded class "${loaded.settings.subjectCode || targetClassId}" with ${loaded.students.length} students from Cloud Firestore!`,
        });
        setConfirmOverwriteClassId(null);
      } else {
        setStatusMessage({ type: 'error', text: 'Class record not found in Firestore.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to load class.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-4">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10">
              <Database className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Firebase Cloud Database</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-300 text-amber-950 font-black">
                  Firestore Enterprise
                </span>
              </h2>
              <p className="text-xs text-amber-100">
                Persistent multi-device cloud storage &amp; real-time database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth / Account Bar */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs">
                {currentUser.displayName ? currentUser.displayName[0] : 'U'}
              </div>
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <span>{currentUser.displayName || 'Instructor'}</span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold bg-amber-100 dark:bg-amber-950 px-1.5 py-0.2 rounded border border-amber-300 dark:border-amber-800">
                    Cloud Auth Active
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">{currentUser.email}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Sign in with Google to enable Cloud Firestore persistence</span>
            </div>
          )}

          <div>
            {!currentUser && (
              <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-medium text-xs shadow-2xs transition-all cursor-pointer"
              >
                <span>{isSigningIn ? 'Connecting...' : 'Sign In'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Cloud Info Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800/80 dark:to-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300">
              <Cloud className="w-4 h-4 text-amber-600" />
              <span>Firestore Region &amp; Cloud Instance</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-slate-500 block">Region:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">asia-east1</span>
              </div>
              <div>
                <span className="text-slate-500 block">Security:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Deployed &amp; Hardened</span>
              </div>
            </div>
          </div>

          {/* Action 1: Save Current Class */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 dark:text-white block text-sm">
                  Save Active Class Record
                </span>
                <span className="text-slate-500 text-[11px]">
                  Subject: <strong className="text-slate-800 dark:text-slate-200">{settings.subjectCode}</strong> • Class: <strong className="text-slate-800 dark:text-slate-200">{settings.className}</strong> ({students.length} students)
                </span>
              </div>
            </div>

            <button
              onClick={handleSaveCurrentClass}
              disabled={isLoading || !currentUser}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
              <span>{currentUser ? 'Save to Cloud Firestore' : 'Sign in to Save to Cloud'}</span>
            </button>
          </div>

          {/* Action 2: Saved Classes in Firestore */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                <span>Your Saved Classes in Cloud Firestore</span>
              </span>
              {currentUser && (
                <button
                  onClick={fetchClasses}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              )}
            </div>

            {!currentUser ? (
              <div className="p-4 text-center text-slate-400 border rounded-xl">
                Sign in above to browse and load your classes stored in Firestore.
              </div>
            ) : savedClasses.length === 0 ? (
              <div className="p-4 text-center text-slate-400 border rounded-xl">
                No classes saved in Firestore yet. Click "Save to Cloud Firestore" above to store your first class.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {savedClasses.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">
                        {c.subjectCode} - {c.className}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {c.subjectName ? `${c.subjectName} • ` : ''}Semester {c.semester} (Year {c.academicYear})
                      </div>
                    </div>

                    <div>
                      {confirmOverwriteClassId === c.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleConfirmLoad(c.id)}
                            className="px-2.5 py-1 bg-rose-600 text-white rounded font-bold text-[10px]"
                          >
                            Confirm Load
                          </button>
                          <button
                            onClick={() => setConfirmOverwriteClassId(null)}
                            className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[10px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmOverwriteClassId(c.id)}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <CloudDownload className="w-3 h-3" />
                          <span>Load Class</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Project: <code className="font-mono text-amber-700 dark:text-amber-400">gen-lang-client-0691472640</code></span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
