export type Language = 'en' | 'th';

export interface Translations {
  // Common / App
  appTitle: string;
  appSubtitle: string;
  themeLight: string;
  themeDark: string;
  language: string;
  
  // Navigation & Header
  navSpreadsheet: string;
  navAnalytics: string;
  navCloudFirestore: string;
  navGoogleSheets: string;
  navGoogleScript: string;
  navAddStudent: string;
  navPasswords: string;
  navStudentPortal: string;
  navQuickBatch: string;
  navExportCSV: string;
  navSettings: string;
  navReset: string;
  
  // Stats strip
  statStudents: string;
  statPassRate: string;
  statClassAverage: string;
  statExcellentGrade4: string;
  
  // Table groups
  grpStudentDetails: string;
  grpAttendance: string;
  grpSpeaking: string;
  grpQuizzes: string;
  grpParticipation: string;
  grpNotebook: string;
  grpEarned: string;
  grpMidterm: string;
  grpFinal: string;
  grpGrandTotal: string;
  grpGrade: string;
  grpActions: string;
  
  // Columns
  colNo: string;
  colStudentId: string;
  colThaiName: string;
  colEnglishName: string;
  colPassword: string;
  colTotalP: string;
  colAttScore: string;
  colEquiv: string;
  colMax: string;
  
  // Remarks
  remRemarks: string;
  remPresent: string;
  remAbsent: string;
  remLate: string;
  remExcused: string;
  remSick: string;
  
  // Search & Filters
  searchPlaceholder: string;
  filterAllGrades: string;
  sortNo: string;
  sortScore: string;
  sortRank: string;
  
  // Student Login
  loginTitle: string;
  loginSubtitle: string;
  loginCardHeading: string;
  loginCardDesc: string;
  loginStudentIdLabel: string;
  loginPasswordLabel: string;
  loginSubmitBtn: string;
  loginTeacherLink: string;
  loginTeacherModalTitle: string;
  loginTeacherModalDesc: string;
  loginTeacherPasscodeLabel: string;
  loginTeacherSubmitBtn: string;
  loginQuickDemoTitle: string;
  loginErrorEmpty: string;
  loginErrorInvalid: string;
  
  // Student Dashboard
  portalHeaderSubtitle: string;
  portalPrintSlip: string;
  portalLogout: string;
  portalSeatNo: string;
  portalId: string;
  portalClass: string;
  portalOfficialGrade: string;
  portalGrandTotal: string;
  portalPassed: string;
  portalFailed: string;
  portalSubject: string;
  portalTerm: string;
  portalYear: string;
  portalInstructor: string;
  portalAttendanceTitle: string;
  portalSpeakingTitle: string;
  portalQuizzesTitle: string;
  portalPartNbTitle: string;
  portalExamsTitle: string;
  portalMidtermScore: string;
  portalFinalScore: string;
  portalFormativeSubtotal: string;
  portalExamsSubtotal: string;
  portalGradingCriteria: string;
  portalYourGrade: string;
  portalPrivacyTitle: string;
  portalPrivacyDesc: string;

  // Midterm & Final specific
  midtermFinalNotice: string;
  max20Each: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    appTitle: 'KR Class Record & Grade Book',
    appSubtitle: 'Secondary & Primary Academic Grading System',
    themeLight: 'Light Mode',
    themeDark: 'Dark Mode',
    language: 'English',

    navSpreadsheet: 'Spreadsheet',
    navAnalytics: 'Analytics',
    navCloudFirestore: 'Cloud Firestore',
    navGoogleSheets: 'Google Sheets',
    navGoogleScript: 'Google Script (.gs)',
    navAddStudent: 'Add Student',
    navPasswords: 'Passwords',
    navStudentPortal: 'Student Portal',
    navQuickBatch: 'Quick Batch',
    navExportCSV: 'Export CSV',
    navSettings: 'Settings',
    navReset: 'Reset Sample',

    statStudents: 'Students',
    statPassRate: 'Pass Rate',
    statClassAverage: 'Class Avg',
    statExcellentGrade4: 'Grade 4.0',

    grpStudentDetails: 'STUDENT DETAILS (ข้อมูลนักเรียน)',
    grpAttendance: 'ATTENDANCE (เวลาเรียน - P, A, L, E, S)',
    grpSpeaking: 'SPEAKING SCORES (ทักษะพูด)',
    grpQuizzes: 'QUIZZES (ทดสอบย่อย)',
    grpParticipation: 'PARTICIPATION (มีส่วนร่วม)',
    grpNotebook: 'NOTEBOOK (สมุด)',
    grpEarned: 'EARNED',
    grpMidterm: 'MIDTERM',
    grpFinal: 'FINAL',
    grpGrandTotal: 'GRAND TOTAL',
    grpGrade: 'GRADE',
    grpActions: 'ACTIONS',

    colNo: '#',
    colStudentId: 'Student ID',
    colThaiName: 'Thai Name',
    colEnglishName: 'English Name',
    colPassword: 'Password',
    colTotalP: 'Total P',
    colAttScore: 'Att.',
    colEquiv: 'Equiv',
    colMax: 'Max',

    remRemarks: 'Remarks',
    remPresent: 'Present (P)',
    remAbsent: 'Absent (A)',
    remLate: 'Late (L)',
    remExcused: 'Excused (E)',
    remSick: 'Sick (S)',

    searchPlaceholder: 'Search name, student ID, or number...',
    filterAllGrades: 'All Grades',
    sortNo: 'No.',
    sortScore: 'Score',
    sortRank: 'Rank',

    loginTitle: 'Student Grade Portal',
    loginSubtitle: 'Official Academic Record & Attendance System',
    loginCardHeading: 'Student Sign In',
    loginCardDesc: 'Enter your assigned Student ID and secure password to view your individual class record.',
    loginStudentIdLabel: 'Student ID Number (เลขประจำตัว)',
    loginPasswordLabel: 'Password (รหัสผ่าน)',
    loginSubmitBtn: 'Sign In to View Grades',
    loginTeacherLink: 'Instructor / Teacher Access',
    loginTeacherModalTitle: 'Teacher Access Verification',
    loginTeacherModalDesc: 'Enter your teacher passcode to access full grading and spreadsheet controls.',
    loginTeacherPasscodeLabel: 'Teacher Passcode',
    loginTeacherSubmitBtn: 'Enter Teacher Dashboard',
    loginQuickDemoTitle: 'Quick Demo Accounts (Click to Fill)',
    loginErrorEmpty: 'Please enter both your Student ID and Password.',
    loginErrorInvalid: 'Invalid Student ID or Password. Please check your credentials or contact your teacher.',

    portalHeaderSubtitle: 'Student Academic Grade & Attendance Portal',
    portalPrintSlip: 'Print Slip',
    portalLogout: 'Log Out',
    portalSeatNo: 'Seat No.',
    portalId: 'Student ID',
    portalClass: 'Class',
    portalOfficialGrade: 'Official Grade (เกรด)',
    portalGrandTotal: 'Grand Total Score',
    portalPassed: 'Passed (ผ่าน)',
    portalFailed: 'Failed (ไม่ผ่าน)',
    portalSubject: 'Subject',
    portalTerm: 'Term',
    portalYear: 'Year',
    portalInstructor: 'Instructor',
    portalAttendanceTitle: 'Attendance Record (เวลาเรียน)',
    portalSpeakingTitle: 'Speaking Scores (ทักษะการพูด)',
    portalQuizzesTitle: 'Quizzes Scores (การทดสอบย่อย)',
    portalPartNbTitle: 'Participation & Notebook (การมีส่วนร่วมและสมุด)',
    portalExamsTitle: 'Term Examinations (Midterm 20 + Final 20 = 40 max)',
    portalMidtermScore: 'Midterm Test Score',
    portalFinalScore: 'Final Test Score',
    portalFormativeSubtotal: 'Formative Earned Score',
    portalExamsSubtotal: 'Term Exams Total',
    portalGradingCriteria: 'Thailand Ministry of Education Grading Criteria (เกณฑ์การตัดเกรด)',
    portalYourGrade: 'YOUR GRADE',
    portalPrivacyTitle: 'Student Privacy & Individual Record Access',
    portalPrivacyDesc: 'This portal only displays your individual verified scores and attendance. Classmates cannot view your private academic marks.',

    midtermFinalNotice: 'Midterm & Final Exam Scores (Max 20 each)',
    max20Each: 'Max 20 pts each',
  },
  th: {
    appTitle: 'ระบบบันทึกคะแนนและเกรด KR Class Record',
    appSubtitle: 'แบบบันทึกผลการเรียนระดับประถมศึกษาและมัธยมศึกษา',
    themeLight: 'โหมดสว่าง',
    themeDark: 'โหมดมืด',
    language: 'ภาษาไทย',

    navSpreadsheet: 'ตารางคะแนน',
    navAnalytics: 'วิเคราะห์ผล',
    navCloudFirestore: 'คลาวด์ Firestore',
    navGoogleSheets: 'กูเกิลชีต',
    navGoogleScript: 'สคริปต์ Google (.gs)',
    navAddStudent: 'เพิ่มนักเรียน',
    navPasswords: 'รหัสผ่าน',
    navStudentPortal: 'ระบบนักเรียน',
    navQuickBatch: 'กรอกด่วน',
    navExportCSV: 'ส่งออก CSV',
    navSettings: 'ตั้งค่า',
    navReset: 'รีเซ็ตข้อมูล',

    statStudents: 'นักเรียนทั้งหมด',
    statPassRate: 'ผ่านเกณฑ์',
    statClassAverage: 'คะแนนเฉลี่ย',
    statExcellentGrade4: 'ได้เกรด 4.0',

    grpStudentDetails: 'ข้อมูลนักเรียน (STUDENT DETAILS)',
    grpAttendance: 'เวลาเรียน (ATTENDANCE - P, A, L, E, S)',
    grpSpeaking: 'ทักษะการพูด (SPEAKING)',
    grpQuizzes: 'การทดสอบย่อย (QUIZZES)',
    grpParticipation: 'การมีส่วนร่วม (PARTICIPATION)',
    grpNotebook: 'สมุดงาน (NOTEBOOK)',
    grpEarned: 'คะแนนเก็บ',
    grpMidterm: 'กลางภาค',
    grpFinal: 'ปลายภาค',
    grpGrandTotal: 'คะแนนรวม',
    grpGrade: 'เกรด',
    grpActions: 'จัดการ',

    colNo: 'เลขที่',
    colStudentId: 'เลขประจำตัว',
    colThaiName: 'ชื่อ-สกุล (ไทย)',
    colEnglishName: 'ชื่อภาษาอังกฤษ',
    colPassword: 'รหัสผ่าน',
    colTotalP: 'มาเรียน',
    colAttScore: 'คะแนนเวลา',
    colEquiv: 'คะแนนเทียบ',
    colMax: 'เต็ม',

    remRemarks: 'สัญลักษณ์เวลาเรียน',
    remPresent: 'มาเรียน (P)',
    remAbsent: 'ขาด (A)',
    remLate: 'สาย (L)',
    remExcused: 'ลา (E)',
    remSick: 'ป่วย (S)',

    searchPlaceholder: 'ค้นหาชื่อ, เลขประจำตัว หรือเลขที่...',
    filterAllGrades: 'ทุกเกรด',
    sortNo: 'เลขที่',
    sortScore: 'คะแนน',
    sortRank: 'อันดับ',

    loginTitle: 'ระบบตรวจสอบผลการเรียนนักเรียน',
    loginSubtitle: 'ระบบรายงานผลการเรียนและเวลาเรียนรายบุคคล',
    loginCardHeading: 'เข้าสู่ระบบนักเรียน',
    loginCardDesc: 'กรอกเลขประจำตัวนักเรียนและรหัสผ่านเพื่อตรวจสอบผลการเรียนรายบุคคล',
    loginStudentIdLabel: 'เลขประจำตัวนักเรียน (Student ID)',
    loginPasswordLabel: 'รหัสผ่าน (Password)',
    loginSubmitBtn: 'เข้าสู่ระบบเพื่อดูเกรด',
    loginTeacherLink: 'เข้าสู่ระบบสำหรับครูผู้สอน',
    loginTeacherModalTitle: 'ยืนยันสิทธิ์สำหรับครูผู้สอน',
    loginTeacherModalDesc: 'กรอกรหัส PIN ของครูเพื่อเข้าจัดการคะแนนและตารางผลการเรียนทั้งหมด',
    loginTeacherPasscodeLabel: 'รหัสผ่านครู (PIN)',
    loginTeacherSubmitBtn: 'เข้าสู่แดชบอร์ดครู',
    loginQuickDemoTitle: 'บัญชีตัวอย่างสำหรับทดสอบ (คลิกเพื่อกรอกอัตโนมัติ)',
    loginErrorEmpty: 'กรุณากรอกทั้งเลขประจำตัวนักเรียนและรหัสผ่าน',
    loginErrorInvalid: 'เลขประจำตัวหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบหรือติดต่อครูประจำวิชา',

    portalHeaderSubtitle: 'ระบบรายงานผลการเรียนและเวลาเรียนรายบุคคลสำหรับนักเรียน',
    portalPrintSlip: 'พิมพ์ใบแจ้งเกรด',
    portalLogout: 'ออกจากระบบ',
    portalSeatNo: 'เลขที่',
    portalId: 'เลขประจำตัว',
    portalClass: 'ชั้นเรียน',
    portalOfficialGrade: 'ผลการเรียน (เกรด)',
    portalGrandTotal: 'คะแนนรวมทั้งหมด',
    portalPassed: 'ผ่านเกณฑ์ (PASS)',
    portalFailed: 'ไม่ผ่านเกณฑ์ (FAIL)',
    portalSubject: 'วิชา',
    portalTerm: 'ภาคเรียน',
    portalYear: 'ปีการศึกษา',
    portalInstructor: 'ครูผู้สอน',
    portalAttendanceTitle: 'สถิติเวลาเรียน (Attendance Record)',
    portalSpeakingTitle: 'คะแนนทักษะการพูด (Speaking Scores)',
    portalQuizzesTitle: 'คะแนนการทดสอบย่อย (Quizzes Scores)',
    portalPartNbTitle: 'คะแนนการมีส่วนร่วมและสมุดงาน (Participation & Notebook)',
    portalExamsTitle: 'คะแนนสอบวัดผล (กลางภาค 20 + ปลายภาค 20 = รวม 40)',
    portalMidtermScore: 'คะแนนสอบกลางภาค',
    portalFinalScore: 'คะแนนสอบปลายภาค',
    portalFormativeSubtotal: 'คะแนนเก็บระหว่างภาค',
    portalExamsSubtotal: 'รวมคะแนนสอบวัดผล',
    portalGradingCriteria: 'เกณฑ์การตัดเกรด กระทรวงศึกษาธิการ (Thai Grading Criteria)',
    portalYourGrade: 'เกรดของคุณ',
    portalPrivacyTitle: 'การรักษาความปลอดภัยและความเป็นส่วนตัวของข้อมูลนักเรียน',
    portalPrivacyDesc: 'ระบบนี้จะแสดงเฉพาะข้อมูลผลการเรียนและเวลาเรียนของตัวคุณเท่านั้น เพื่อนในชั้นเรียนจะไม่สามารถเข้าถึงข้อมูลส่วนตัวของคุณได้',

    midtermFinalNotice: 'คะแนนสอบกลางภาคและปลายภาค (คะแนนเต็มวิชาละ 20)',
    max20Each: 'คะแนนเต็มอย่างละ 20 คะแนน',
  },
};
