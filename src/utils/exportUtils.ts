import { AttendanceDay, ClassSettings, ScoreColumn, StudentCalculation } from '../types/classRecord';

export function exportToCSV(
  settings: ClassSettings,
  calculations: StudentCalculation[],
  attendanceDays: AttendanceDay[],
  speakingColumns: ScoreColumn[],
  quizzesColumns: ScoreColumn[],
  participationColumns: ScoreColumn[],
  notebookColumns: ScoreColumn[]
): void {
  const headers = [
    'No',
    'StudentID',
    'ThaiName',
    'EnglishName',
    'Password',
    ...attendanceDays.map((d) => `Att_${d.name}`),
    'TotalPresences',
    `AttendanceScore_Max${settings.attendanceMaxScore}`,
    ...speakingColumns.map((c) => `Spk_${c.name}_Max${c.maxScore}`),
    `SpeakingScore_Max${settings.speakingMaxScore}`,
    ...quizzesColumns.map((c) => `Quiz_${c.name}_Max${c.maxScore}`),
    `QuizScore_Max${settings.quizzesMaxScore}`,
    ...participationColumns.map((c) => `Part_${c.name}_Max${c.maxScore}`),
    `ParticipationScore_Max${settings.participationMaxScore}`,
    ...notebookColumns.map((c) => `NB_${c.name}_Max${c.maxScore}`),
    `NotebookScore_Max${settings.notebookMaxScore}`,
    `EarnedScores_Max${settings.earnedMaxScore}`,
    `Midterm_Max${settings.midtermMaxScore}`,
    `Final_Max${settings.finalMaxScore}`,
    'GrandTotal_100',
    'Grade_Scale0to4',
    'ThaiGradeLabel',
    'Result'
  ];

  const rows = calculations.map((c) => {
    const s = c.student;
    return [
      s.number,
      `"${s.studentNumber}"`,
      `"${s.thaiName}"`,
      `"${s.englishName}"`,
      `"${s.password || `STU-${s.studentNumber}`}"`,
      ...attendanceDays.map((d) => `"${s.attendance[d.id] || ''}"`),
      c.presencesCount,
      c.attendanceScore.toFixed(2),
      ...speakingColumns.map((col) => s.speakingScores[col.id] ?? ''),
      c.speakingScore.toFixed(2),
      ...quizzesColumns.map((col) => s.quizzesScores[col.id] ?? ''),
      c.quizzesScore.toFixed(2),
      ...participationColumns.map((col) => s.participationScores[col.id] ?? ''),
      c.participationScore.toFixed(2),
      ...notebookColumns.map((col) => s.notebookScores[col.id] ?? ''),
      c.notebookScore.toFixed(2),
      c.earnedScores.toFixed(2),
      c.midtermScore.toFixed(2),
      c.finalScore.toFixed(2),
      c.grandTotal.toFixed(2),
      c.grade.toFixed(1),
      `"${c.gradeThaiLabel}"`,
      c.isPassed ? 'PASS' : 'FAIL'
    ].join(',');
  });

  // Include UTF-8 BOM so Thai characters display properly in Microsoft Excel and Google Sheets
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ClassRecord_${settings.subjectCode}_${settings.className.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
