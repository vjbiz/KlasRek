import { AttendanceDay, AttendanceRemark, ClassSettings, ScoreColumn, Student, StudentCalculation } from '../types/classRecord';

export const REMARKS_INFO: Record<AttendanceRemark, { label: string; thaiLabel: string; color: string; badgeBg: string }> = {
  P: { label: 'Present', thaiLabel: 'มาเรียน', color: 'text-emerald-700 dark:text-emerald-300', badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' },
  A: { label: 'Absent', thaiLabel: 'ขาดเรียน', color: 'text-rose-700 dark:text-rose-300', badgeBg: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800' },
  L: { label: 'Late', thaiLabel: 'มาสาย', color: 'text-amber-700 dark:text-amber-300', badgeBg: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' },
  E: { label: 'Excused', thaiLabel: 'ลากิจ', color: 'text-sky-700 dark:text-sky-300', badgeBg: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800' },
  S: { label: 'Sick', thaiLabel: 'ลาป่วย', color: 'text-purple-700 dark:text-purple-300', badgeBg: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800' },
};

export const THAI_GRADE_SCALE = [
  { min: 80, grade: 4.0, label: 'Excellent', thai: 'ดีเยี่ยม', color: 'bg-emerald-500 text-white dark:bg-emerald-600', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300' },
  { min: 75, grade: 3.5, label: 'Very Good', thai: 'ดีมาก', color: 'bg-teal-500 text-white dark:bg-teal-600', badge: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/70 dark:text-teal-300' },
  { min: 70, grade: 3.0, label: 'Good', thai: 'ดี', color: 'bg-blue-500 text-white dark:bg-blue-600', badge: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300' },
  { min: 65, grade: 2.5, label: 'Fairly Good', thai: 'ค่อนข้างดี', color: 'bg-cyan-600 text-white dark:bg-cyan-700', badge: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/70 dark:text-cyan-300' },
  { min: 60, grade: 2.0, label: 'Fair / Satisfactory', thai: 'ปานกลาง', color: 'bg-amber-500 text-white dark:bg-amber-600', badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300' },
  { min: 55, grade: 1.5, label: 'Pass', thai: 'พอใช้', color: 'bg-orange-500 text-white dark:bg-orange-600', badge: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/70 dark:text-orange-300' },
  { min: 50, grade: 1.0, label: 'Minimum Pass', thai: 'ผ่านเกณฑ์ขั้นต่ำ', color: 'bg-stone-500 text-white dark:bg-stone-600', badge: 'bg-stone-200 text-stone-800 border-stone-300 dark:bg-stone-800 dark:text-stone-300' },
  { min: 0, grade: 0.0, label: 'Fail / Repeat', thai: 'ไม่ผ่าน (ตก)', color: 'bg-rose-500 text-white dark:bg-rose-600', badge: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300' },
];

export function calculateGrade(grandTotal: number): {
  grade: number;
  label: string;
  thai: string;
  color: string;
  isPassed: boolean;
} {
  const roundedScore = Math.round(grandTotal * 10) / 10;
  for (const tier of THAI_GRADE_SCALE) {
    if (roundedScore >= tier.min) {
      return {
        grade: tier.grade,
        label: tier.label,
        thai: tier.thai,
        color: tier.badge,
        isPassed: tier.grade >= 1.0,
      };
    }
  }
  return {
    grade: 0.0,
    label: 'Fail',
    thai: 'ไม่ผ่าน',
    color: 'bg-rose-100 text-rose-800 border-rose-300',
    isPassed: false,
  };
}

export function computeStudentCalculation(
  student: Student,
  attendanceDays: AttendanceDay[],
  speakingColumns: ScoreColumn[],
  quizzesColumns: ScoreColumn[],
  participationColumns: ScoreColumn[],
  notebookColumns: ScoreColumn[],
  settings: ClassSettings
): StudentCalculation {
  // 1. Attendance calculation
  let presencesCount = 0;
  let absentsCount = 0;
  let latesCount = 0;
  let excusedCount = 0;
  let sickCount = 0;

  attendanceDays.forEach((day) => {
    const remark = student.attendance[day.id];
    if (remark === 'P') presencesCount++;
    else if (remark === 'A') absentsCount++;
    else if (remark === 'L') {
      latesCount++;
      if (settings.lateCountsAsHalf) {
        presencesCount += 0.5;
      }
    } else if (remark === 'E') excusedCount++;
    else if (remark === 'S') sickCount++;
  });

  const totalDays = attendanceDays.length;
  // Summary Attendance Score (15 is the highest)
  const attendanceScore =
    totalDays > 0
      ? Number(((presencesCount / totalDays) * settings.attendanceMaxScore).toFixed(2))
      : 0;

  // 2. Speaking scores calculation (15 highest)
  let speakingRaw = 0;
  let speakingMaxRaw = 0;
  speakingColumns.forEach((col) => {
    speakingMaxRaw += col.maxScore;
    const val = student.speakingScores[col.id];
    if (val !== null && val !== undefined) {
      speakingRaw += val;
    }
  });
  const speakingScore =
    speakingMaxRaw > 0
      ? Number(((speakingRaw / speakingMaxRaw) * settings.speakingMaxScore).toFixed(2))
      : 0;

  // 3. Quizzes scores calculation (15 highest)
  let quizzesRaw = 0;
  let quizzesMaxRaw = 0;
  quizzesColumns.forEach((col) => {
    quizzesMaxRaw += col.maxScore;
    const val = student.quizzesScores[col.id];
    if (val !== null && val !== undefined) {
      quizzesRaw += val;
    }
  });
  const quizzesScore =
    quizzesMaxRaw > 0
      ? Number(((quizzesRaw / quizzesMaxRaw) * settings.quizzesMaxScore).toFixed(2))
      : 0;

  // 4. Participation scores calculation (highest based on settings, default 5 or 15)
  let participationRaw = 0;
  let participationMaxRaw = 0;
  participationColumns.forEach((col) => {
    participationMaxRaw += col.maxScore;
    const val = student.participationScores[col.id];
    if (val !== null && val !== undefined) {
      participationRaw += val;
    }
  });
  const participationScore =
    participationMaxRaw > 0
      ? Number(((participationRaw / participationMaxRaw) * settings.participationMaxScore).toFixed(2))
      : 0;

  // 5. Notebook scores calculation (10 highest)
  let notebookRaw = 0;
  let notebookMaxRaw = 0;
  notebookColumns.forEach((col) => {
    notebookMaxRaw += col.maxScore;
    const val = student.notebookScores[col.id];
    if (val !== null && val !== undefined) {
      notebookRaw += val;
    }
  });
  const notebookScore =
    notebookMaxRaw > 0
      ? Number(((notebookRaw / notebookMaxRaw) * settings.notebookMaxScore).toFixed(2))
      : 0;

  // 6. Summary of Earned Scores (attendance + speaking + quizzes + participation + notebook)
  // Highest total must be 60
  const rawEarned = attendanceScore + speakingScore + quizzesScore + participationScore + notebookScore;
  const earnedScores = Number(Math.min(settings.earnedMaxScore, rawEarned).toFixed(2));

  // 7. Midterm and Final (20 each)
  const midterm = student.midtermScore !== null && student.midtermScore !== undefined ? Math.min(settings.midtermMaxScore, student.midtermScore) : 0;
  const final = student.finalScore !== null && student.finalScore !== undefined ? Math.min(settings.finalMaxScore, student.finalScore) : 0;

  // 8. Grand Total Score (Earned 60 + Midterm 20 + Final 20 = 100)
  const grandTotal = Number((earnedScores + midterm + final).toFixed(2));

  // 9. Equivalency Grade
  const gradeInfo = calculateGrade(grandTotal);

  return {
    student,
    presencesCount,
    absentsCount,
    latesCount,
    excusedCount,
    sickCount,
    totalDays,
    attendanceScore,
    speakingRaw,
    speakingMaxRaw,
    speakingScore,
    quizzesRaw,
    quizzesMaxRaw,
    quizzesScore,
    participationRaw,
    participationMaxRaw,
    participationScore,
    notebookRaw,
    notebookMaxRaw,
    notebookScore,
    earnedScores,
    midtermScore: midterm,
    finalScore: final,
    grandTotal,
    grade: gradeInfo.grade,
    gradeLabel: gradeInfo.label,
    gradeThaiLabel: gradeInfo.thai,
    gradeColor: gradeInfo.color,
    isPassed: gradeInfo.isPassed,
  };
}

export function rankStudents(calcs: StudentCalculation[]): StudentCalculation[] {
  const sorted = [...calcs].sort((a, b) => b.grandTotal - a.grandTotal);
  const ranksMap = new Map<string, number>();

  let currentRank = 1;
  sorted.forEach((item, index) => {
    if (index > 0 && item.grandTotal < sorted[index - 1].grandTotal) {
      currentRank = index + 1;
    }
    ranksMap.set(item.student.id, currentRank);
  });

  return calcs.map((item) => ({
    ...item,
    rank: ranksMap.get(item.student.id) || 1,
  }));
}

export function generateGoogleSheetsFormula(totalCell: string = 'V5'): string {
  // IF(V5>=80, 4, IF(V5>=75, 3.5, IF(V5>=70, 3, IF(V5>=65, 2.5, IF(V5>=60, 2, IF(V5>=55, 1.5, IF(V5>=50, 1, 0)))))))
  return `=IF(${totalCell}>=80, 4, IF(${totalCell}>=75, 3.5, IF(${totalCell}>=70, 3, IF(${totalCell}>=65, 2.5, IF(${totalCell}>=60, 2, IF(${totalCell}>=55, 1.5, IF(${totalCell}>=50, 1, 0)))))))`;
}
