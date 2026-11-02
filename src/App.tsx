import React, { useState, useEffect } from 'react';
import { 
  ClassSettings, 
  AttendanceDay, 
  ScoreColumn, 
  Student, 
  AttendanceRemark,
  StudentCalculation 
} from './types/classRecord';
import { 
  INITIAL_SETTINGS, 
  INITIAL_ATTENDANCE_DAYS, 
  INITIAL_SPEAKING_COLUMNS, 
  INITIAL_QUIZZES_COLUMNS, 
  INITIAL_PARTICIPATION_COLUMNS, 
  INITIAL_NOTEBOOK_COLUMNS, 
  INITIAL_STUDENTS 
} from './data/sampleStudents';
import { computeStudentCalculation, rankStudents } from './utils/gradeCalculations';
import { exportToCSV } from './utils/exportUtils';
import { ClassHeader } from './components/ClassHeader';
import { SpreadsheetView } from './components/SpreadsheetView';
import { AnalyticsView } from './components/AnalyticsView';
import { StudentModal } from './components/StudentModal';
import { GoogleScriptModal } from './components/GoogleScriptModal';
import { SettingsModal } from './components/SettingsModal';
import { BatchInputModal } from './components/BatchInputModal';
import { AddColumnModal } from './components/AddColumnModal';
import { StudentLogin } from './components/StudentLogin';
import { StudentDashboard } from './components/StudentDashboard';
import { StudentCredentialsModal } from './components/StudentCredentialsModal';

export default function App() {
  // Local storage keys
  const STORAGE_KEY_SETTINGS = 'thai_class_record_settings_v1';
  const STORAGE_KEY_STUDENTS = 'thai_class_record_students_v1';
  const STORAGE_KEY_DAYS = 'thai_class_record_days_v1';
  const STORAGE_KEY_SPK = 'thai_class_record_spk_v1';
  const STORAGE_KEY_QZ = 'thai_class_record_qz_v1';
  const STORAGE_KEY_PART = 'thai_class_record_part_v1';
  const STORAGE_KEY_NB = 'thai_class_record_nb_v1';

  // State with LocalStorage fallbacks
  const [settings, setSettings] = useState<ClassSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [attendanceDays, setAttendanceDays] = useState<AttendanceDay[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DAYS);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE_DAYS;
  });

  const [speakingColumns, setSpeakingColumns] = useState<ScoreColumn[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SPK);
    return saved ? JSON.parse(saved) : INITIAL_SPEAKING_COLUMNS;
  });

  const [quizzesColumns, setQuizzesColumns] = useState<ScoreColumn[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_QZ);
    return saved ? JSON.parse(saved) : INITIAL_QUIZZES_COLUMNS;
  });

  const [participationColumns, setParticipationColumns] = useState<ScoreColumn[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PART);
    return saved ? JSON.parse(saved) : INITIAL_PARTICIPATION_COLUMNS;
  });

  const [notebookColumns, setNotebookColumns] = useState<ScoreColumn[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_NB);
    return saved ? JSON.parse(saved) : INITIAL_NOTEBOOK_COLUMNS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  // Authentication & Portal View State
  const [currentMode, setCurrentMode] = useState<'student_login' | 'student_portal' | 'teacher'>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'teacher') return 'teacher';
    const savedLoggedId = sessionStorage.getItem('logged_student_id');
    if (savedLoggedId) return 'student_portal';
    return 'student_login';
  });

  const [loggedStudentId, setLoggedStudentId] = useState<string | null>(() => {
    return sessionStorage.getItem('logged_student_id');
  });

  // UI state for Teacher Mode
  const [activeView, setActiveView] = useState<'spreadsheet' | 'analytics'>('spreadsheet');
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isGoogleScriptModalOpen, setIsGoogleScriptModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);

  const [addColumnCategory, setAddColumnCategory] = useState<'speaking' | 'quizzes' | 'participation' | 'notebook' | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DAYS, JSON.stringify(attendanceDays));
  }, [attendanceDays]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SPK, JSON.stringify(speakingColumns));
  }, [speakingColumns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_QZ, JSON.stringify(quizzesColumns));
  }, [quizzesColumns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PART, JSON.stringify(participationColumns));
  }, [participationColumns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NB, JSON.stringify(notebookColumns));
  }, [notebookColumns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
  }, [students]);

  // Compute all students scores and rankings
  const rawCalculations: StudentCalculation[] = students.map((s) =>
    computeStudentCalculation(
      s,
      attendanceDays,
      speakingColumns,
      quizzesColumns,
      participationColumns,
      notebookColumns,
      settings
    )
  );
  const calculations = rankStudents(rawCalculations);

  // Authentication Handlers
  const handleStudentLoginSuccess = (student: Student) => {
    setLoggedStudentId(student.id);
    sessionStorage.setItem('logged_student_id', student.id);
    setCurrentMode('student_portal');
  };

  const handleStudentLogout = () => {
    setLoggedStudentId(null);
    sessionStorage.removeItem('logged_student_id');
    setCurrentMode('student_login');
  };

  // Student Attendance Handler
  const handleUpdateAttendance = (studentId: string, dayId: string, remark: AttendanceRemark | '') => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          attendance: {
            ...s.attendance,
            [dayId]: remark,
          },
        };
      })
    );
  };

  // Student Assessment Score Handler
  const handleUpdateScore = (
    studentId: string,
    category: 'speaking' | 'quizzes' | 'participation' | 'notebook',
    colId: string,
    val: number | null
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        if (category === 'speaking') {
          return { ...s, speakingScores: { ...s.speakingScores, [colId]: val } };
        } else if (category === 'quizzes') {
          return { ...s, quizzesScores: { ...s.quizzesScores, [colId]: val } };
        } else if (category === 'participation') {
          return { ...s, participationScores: { ...s.participationScores, [colId]: val } };
        } else {
          return { ...s, notebookScores: { ...s.notebookScores, [colId]: val } };
        }
      })
    );
  };

  // Student Exam Score Handler
  const handleUpdateExam = (studentId: string, type: 'midterm' | 'final', val: number | null) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          [type === 'midterm' ? 'midtermScore' : 'finalScore']: val,
        };
      })
    );
  };

  // Add Attendance Day
  const handleAddAttendanceDay = () => {
    const nextNum = attendanceDays.length + 1;
    const newDay: AttendanceDay = {
      id: `att_${Date.now()}`,
      name: `D${nextNum}`,
      date: `Session ${nextNum}`,
    };
    setAttendanceDays([...attendanceDays, newDay]);
  };

  const handleRemoveAttendanceDay = (dayId: string) => {
    if (attendanceDays.length <= 1) return;
    setAttendanceDays(attendanceDays.filter((d) => d.id !== dayId));
  };

  // Dynamic Column Handlers
  const handleAddColumnTrigger = (category: 'speaking' | 'quizzes' | 'participation' | 'notebook') => {
    setAddColumnCategory(category);
  };

  const handleConfirmAddColumn = (name: string, maxScore: number) => {
    if (!addColumnCategory) return;
    const newCol: ScoreColumn = {
      id: `${addColumnCategory}_${Date.now()}`,
      name,
      maxScore,
    };

    if (addColumnCategory === 'speaking') {
      setSpeakingColumns([...speakingColumns, newCol]);
    } else if (addColumnCategory === 'quizzes') {
      setQuizzesColumns([...quizzesColumns, newCol]);
    } else if (addColumnCategory === 'participation') {
      setParticipationColumns([...participationColumns, newCol]);
    } else if (addColumnCategory === 'notebook') {
      setNotebookColumns([...notebookColumns, newCol]);
    }
  };

  const handleRemoveColumn = (
    category: 'speaking' | 'quizzes' | 'participation' | 'notebook',
    colId: string
  ) => {
    if (category === 'speaking' && speakingColumns.length > 1) {
      setSpeakingColumns(speakingColumns.filter((c) => c.id !== colId));
    } else if (category === 'quizzes' && quizzesColumns.length > 1) {
      setQuizzesColumns(quizzesColumns.filter((c) => c.id !== colId));
    } else if (category === 'participation' && participationColumns.length > 1) {
      setParticipationColumns(participationColumns.filter((c) => c.id !== colId));
    } else if (category === 'notebook' && notebookColumns.length > 1) {
      setNotebookColumns(notebookColumns.filter((c) => c.id !== colId));
    }
  };

  // Student Save / Edit / Delete
  const handleSaveStudent = (studentToSave: Student) => {
    setStudents((prev) => {
      const exists = prev.some((s) => s.id === studentToSave.id);
      if (exists) {
        return prev.map((s) => (s.id === studentToSave.id ? studentToSave : s));
      }
      return [...prev, studentToSave].sort((a, b) => a.number - b.number);
    });
    setIsStudentModalOpen(false);
    setEditingStudent(null);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsStudentModalOpen(true);
  };

  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm('Are you sure you want to remove this student record?')) {
      setStudents(students.filter((s) => s.id !== studentId));
    }
  };

  // Batch actions
  const handleBatchAttendance = (dayId: string, remark: AttendanceRemark) => {
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        attendance: {
          ...s.attendance,
          [dayId]: remark,
        },
      }))
    );
  };

  const handleBatchScore = (
    category: 'speaking' | 'quizzes' | 'participation' | 'notebook',
    colId: string,
    score: number
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (category === 'speaking') {
          return { ...s, speakingScores: { ...s.speakingScores, [colId]: score } };
        } else if (category === 'quizzes') {
          return { ...s, quizzesScores: { ...s.quizzesScores, [colId]: score } };
        } else if (category === 'participation') {
          return { ...s, participationScores: { ...s.participationScores, [colId]: score } };
        } else {
          return { ...s, notebookScores: { ...s.notebookScores, [colId]: score } };
        }
      })
    );
  };

  const handleBatchExam = (type: 'midterm' | 'final', score: number) => {
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        [type === 'midterm' ? 'midtermScore' : 'finalScore']: score,
      }))
    );
  };

  // Reset to default sample
  const handleResetData = () => {
    if (window.confirm('Reset all students, credentials, and columns back to default sample data?')) {
      setSettings(INITIAL_SETTINGS);
      setAttendanceDays(INITIAL_ATTENDANCE_DAYS);
      setSpeakingColumns(INITIAL_SPEAKING_COLUMNS);
      setQuizzesColumns(INITIAL_QUIZZES_COLUMNS);
      setParticipationColumns(INITIAL_PARTICIPATION_COLUMNS);
      setNotebookColumns(INITIAL_NOTEBOOK_COLUMNS);
      setStudents(INITIAL_STUDENTS);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    exportToCSV(
      settings,
      calculations,
      attendanceDays,
      speakingColumns,
      quizzesColumns,
      participationColumns,
      notebookColumns
    );
  };

  // Print Report
  const handlePrintReport = () => {
    window.print();
  };

  // -------------------------------------------------------------
  // VIEW 1: STUDENT LOGIN SCREEN
  // -------------------------------------------------------------
  if (currentMode === 'student_login') {
    return (
      <StudentLogin
        settings={settings}
        students={students}
        calculations={calculations}
        onLoginSuccess={handleStudentLoginSuccess}
        onTeacherLogin={() => setCurrentMode('teacher')}
      />
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: LOGGED-IN STUDENT PORTAL (INDIVIDUAL ACCESS ONLY)
  // -------------------------------------------------------------
  if (currentMode === 'student_portal') {
    const studentCalculation = calculations.find((c) => c.student.id === loggedStudentId);

    if (!studentCalculation) {
      // In case student record is missing or deleted
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
          <div className="bg-slate-800 p-6 rounded-2xl max-w-sm text-center space-y-4">
            <h2 className="text-lg font-bold text-rose-400">Student Record Not Found</h2>
            <p className="text-xs text-slate-300">
              The student record may have been modified or removed by your instructor.
            </p>
            <button
              onClick={handleStudentLogout}
              className="px-4 py-2 bg-indigo-600 rounded-lg text-xs font-bold text-white"
            >
              Back to Login
            </button>
          </div>
        </div>
      );
    }

    return (
      <StudentDashboard
        calculation={studentCalculation}
        attendanceDays={attendanceDays}
        speakingColumns={speakingColumns}
        quizzesColumns={quizzesColumns}
        participationColumns={participationColumns}
        notebookColumns={notebookColumns}
        settings={settings}
        onLogout={handleStudentLogout}
      />
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: INSTRUCTOR / TEACHER DASHBOARD (FULL GRADING SPREADSHEET)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <ClassHeader
        settings={settings}
        calculations={calculations}
        onOpenAddStudent={() => {
          setEditingStudent(null);
          setIsStudentModalOpen(true);
        }}
        onOpenGoogleScript={() => setIsGoogleScriptModalOpen(true)}
        onOpenAnalytics={() => setActiveView('analytics')}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenBatchInput={() => setIsBatchModalOpen(true)}
        onExportCSV={handleExportCSV}
        onPrintReport={handlePrintReport}
        onResetData={handleResetData}
        onOpenCredentials={() => setIsCredentialsModalOpen(true)}
        onSwitchToStudentPortal={() => setCurrentMode('student_login')}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
        {activeView === 'spreadsheet' ? (
          <SpreadsheetView
            students={students}
            calculations={calculations}
            attendanceDays={attendanceDays}
            speakingColumns={speakingColumns}
            quizzesColumns={quizzesColumns}
            participationColumns={participationColumns}
            notebookColumns={notebookColumns}
            settings={settings}
            onUpdateAttendance={handleUpdateAttendance}
            onUpdateScore={handleUpdateScore}
            onUpdateExam={handleUpdateExam}
            onAddAttendanceDay={handleAddAttendanceDay}
            onRemoveAttendanceDay={handleRemoveAttendanceDay}
            onAddColumn={handleAddColumnTrigger}
            onRemoveColumn={handleRemoveColumn}
            onEditStudent={handleEditStudent}
            onDeleteStudent={handleDeleteStudent}
            onAddStudent={() => {
              setEditingStudent(null);
              setIsStudentModalOpen(true);
            }}
          />
        ) : (
          <AnalyticsView
            calculations={calculations}
            settings={settings}
            onEditStudent={(id) => {
              const std = students.find((s) => s.id === id);
              if (std) handleEditStudent(std);
            }}
          />
        )}
      </main>

      {/* Footer Info */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Thai Class Record System • Formula:{' '}
            <code className="text-indigo-600 dark:text-indigo-400 font-mono">
              IF(Total&gt;=80, 4, IF(Total&gt;=75, 3.5, ...))
            </code>
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCredentialsModalOpen(true)}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              🔑 Student Passwords &amp; Slips
            </button>
            <span>•</span>
            <button
              onClick={() => setIsGoogleScriptModalOpen(true)}
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              📋 Google Apps Script (.gs) Generator
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setEditingStudent(null);
        }}
        onSave={handleSaveStudent}
        editingStudent={editingStudent}
        attendanceDays={attendanceDays}
        speakingColumns={speakingColumns}
        quizzesColumns={quizzesColumns}
        participationColumns={participationColumns}
        notebookColumns={notebookColumns}
        settings={settings}
        nextNumber={students.length + 1}
      />

      <StudentCredentialsModal
        isOpen={isCredentialsModalOpen}
        onClose={() => setIsCredentialsModalOpen(false)}
        students={students}
        settings={settings}
        onUpdatePasswords={setStudents}
      />

      <GoogleScriptModal
        isOpen={isGoogleScriptModalOpen}
        onClose={() => setIsGoogleScriptModalOpen(false)}
        settings={settings}
        attendanceDays={attendanceDays}
        speakingColumns={speakingColumns}
        quizzesColumns={quizzesColumns}
        participationColumns={participationColumns}
        notebookColumns={notebookColumns}
        students={students}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
      />

      <BatchInputModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        students={students}
        attendanceDays={attendanceDays}
        speakingColumns={speakingColumns}
        quizzesColumns={quizzesColumns}
        participationColumns={participationColumns}
        notebookColumns={notebookColumns}
        onBatchAttendance={handleBatchAttendance}
        onBatchScore={handleBatchScore}
        onBatchExam={handleBatchExam}
      />

      <AddColumnModal
        isOpen={addColumnCategory !== null}
        category={addColumnCategory}
        onClose={() => setAddColumnCategory(null)}
        onAdd={handleConfirmAddColumn}
      />
    </div>
  );
}
