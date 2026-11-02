export type AttendanceRemark = 'P' | 'A' | 'L' | 'E' | 'S';

export interface AttendanceDay {
  id: string;
  name: string; // e.g., "Day 1", "W1-D1"
  date?: string;
}

export interface ScoreColumn {
  id: string;
  name: string;
  maxScore: number;
}

export interface Student {
  id: string;
  number: number; // Student sequence number (1, 2, 3...)
  studentNumber: string; // Student ID (เลขประจำตัว)
  thaiName: string; // Thai full name (ชื่อ-สกุล)
  englishName: string; // English full name
  attendance: Record<string, AttendanceRemark | ''>; // dayId -> remark
  speakingScores: Record<string, number | null>; // columnId -> score
  quizzesScores: Record<string, number | null>; // columnId -> score
  participationScores: Record<string, number | null>; // columnId -> score
  notebookScores: Record<string, number | null>; // columnId -> score
  midtermScore: number | null; // Max 20
  finalScore: number | null; // Max 20
  password?: string; // Pre-set unique student password
  notes?: string;
}

export interface StudentAuthSession {
  studentId: string; // Internal ID
  studentNumber: string; // Student ID number
  thaiName: string;
  englishName: string;
  loginTime: string;
}

export interface ClassSettings {
  className: string; // e.g., "Mattayom 1/2" or "Grade 10-A"
  subjectCode: string; // e.g., "EN21101"
  subjectName: string; // e.g., "Fundamental English"
  academicYear: string; // e.g., "2567 (2024-2025)"
  semester: string; // "Semester 1" or "Semester 2"
  teacherName: string;
  
  // Maximum points configuration
  attendanceMaxScore: number; // 15
  speakingMaxScore: number; // 15
  quizzesMaxScore: number; // 15
  participationMaxScore: number; // 5 or 15 (default 5 so 15+15+15+5+10 = 60)
  notebookMaxScore: number; // 10
  earnedMaxScore: number; // 60
  midtermMaxScore: number; // 20
  finalMaxScore: number; // 20
  
  // Late counts as partial presence (optional)
  lateCountsAsHalf: boolean;
  
  // Google Apps Script Web App Backend URL for live student auth
  googleWebAppUrl?: string;
  // Teacher access PIN (default: "teacher123")
  teacherPin?: string;
}

export interface StudentCalculation {
  student: Student;
  presencesCount: number;
  absentsCount: number;
  latesCount: number;
  excusedCount: number;
  sickCount: number;
  totalDays: number;
  attendanceScore: number; // out of 15
  
  speakingRaw: number;
  speakingMaxRaw: number;
  speakingScore: number; // out of 15
  
  quizzesRaw: number;
  quizzesMaxRaw: number;
  quizzesScore: number; // out of 15
  
  participationRaw: number;
  participationMaxRaw: number;
  participationScore: number; // out of 5/15
  
  notebookRaw: number;
  notebookMaxRaw: number;
  notebookScore: number; // out of 10
  
  earnedScores: number; // out of 60
  midtermScore: number; // out of 20
  finalScore: number; // out of 20
  grandTotal: number; // out of 100
  grade: number; // 0, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0
  gradeLabel: string;
  gradeThaiLabel: string;
  gradeColor: string;
  isPassed: boolean;
  rank?: number;
}
