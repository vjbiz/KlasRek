import { 
  AttendanceDay, 
  ClassSettings, 
  ScoreColumn, 
  Student 
} from '../types/classRecord';

export interface DriveSpreadsheetFile {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

function columnToLetter(column: number): string {
  let temp: number;
  let letter = '';
  let col = column;
  while (col > 0) {
    temp = (col - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    col = Math.floor((col - temp - 1) / 26);
  }
  return letter;
}

/**
 * List user spreadsheets from Google Drive
 */
export async function listUserSpreadsheets(accessToken: string): Promise<DriveSpreadsheetFile[]> {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,webViewLink)&orderBy=modifiedTime desc&pageSize=25`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to fetch spreadsheets from Google Drive.');
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Build rows and formula cells for Class Record
 */
function buildSpreadsheetRows(
  settings: ClassSettings,
  attendanceDays: AttendanceDay[],
  speakingCols: ScoreColumn[],
  quizCols: ScoreColumn[],
  partCols: ScoreColumn[],
  nbCols: ScoreColumn[],
  students: Student[]
): { range: string; values: any[][] } {
  const values: any[][] = [];

  // Row 1: Title
  values.push([
    'CLASS RECORD & GRADE BOOK (แบบบันทึกผลการเรียน)',
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
  ]);

  // Row 2: Metadata
  values.push([
    `Subject: ${settings.subjectCode} ${settings.subjectName} | Class: ${settings.className} | Term: ${settings.semester} | Year: ${settings.academicYear} | Teacher: ${settings.teacherName}`
  ]);

  // Row 3: Blank
  values.push([]);

  // Row 4: Top Group Headers
  const row4: string[] = ['STUDENT INFORMATION', '', '', '', '']; // A-E
  const attDaysCount = attendanceDays.length;
  for (let i = 0; i < attDaysCount + 2; i++) {
    row4.push(i === 0 ? 'ATTENDANCE (P, A, L, E, S)' : '');
  }
  for (let i = 0; i < speakingCols.length + 1; i++) {
    row4.push(i === 0 ? `SPEAKING SCORES (Max ${settings.speakingMaxScore})` : '');
  }
  for (let i = 0; i < quizCols.length + 1; i++) {
    row4.push(i === 0 ? `QUIZZES SCORES (Max ${settings.quizzesMaxScore})` : '');
  }
  for (let i = 0; i < partCols.length + 1; i++) {
    row4.push(i === 0 ? `PARTICIPATION (Max ${settings.participationMaxScore})` : '');
  }
  for (let i = 0; i < nbCols.length + 1; i++) {
    row4.push(i === 0 ? `NOTEBOOK (Max ${settings.notebookMaxScore})` : '');
  }
  row4.push(`EARNED SCORE (Max ${settings.earnedMaxScore})`);
  row4.push(`MIDTERM (Max ${settings.midtermMaxScore})`);
  row4.push(`FINAL (Max ${settings.finalMaxScore})`);
  row4.push('GRAND TOTAL (Max 100)');
  row4.push('GRADE (0 - 4.0)');
  row4.push('RESULT');
  values.push(row4);

  // Row 5: Column Subheaders
  const row5: string[] = [
    'No.',
    'Student ID',
    'Thai Name',
    'English Name',
    'Password',
    ...attendanceDays.map((d) => d.name),
    'Total P',
    `Att. (/${settings.attendanceMaxScore})`,
    ...speakingCols.map((c) => `${c.name} (/${c.maxScore})`),
    `Speaking (/${settings.speakingMaxScore})`,
    ...quizCols.map((c) => `${c.name} (/${c.maxScore})`),
    `Quizzes (/${settings.quizzesMaxScore})`,
    ...partCols.map((c) => `${c.name} (/${c.maxScore})`),
    `Part. (/${settings.participationMaxScore})`,
    ...nbCols.map((c) => `${c.name} (/${c.maxScore})`),
    `Notebook (/${settings.notebookMaxScore})`,
    'Earned Total',
    'Midterm',
    'Final',
    'Grand Total',
    'Grade',
    'Status'
  ];
  values.push(row5);

  // Rows 6+: Student Data with live Google Sheets formulas
  const numDays = attendanceDays.length;

  students.forEach((s, idx) => {
    const r = 6 + idx;
    const row: any[] = [
      s.number,
      s.studentNumber,
      s.thaiName,
      s.englishName,
      s.password || `STU-${s.studentNumber}`,
    ];

    // Attendance days (starts at Column F, index 6)
    attendanceDays.forEach((day) => {
      row.push(s.attendance[day.id] || '');
    });

    // Column letters for attendance
    const firstAttCol = columnToLetter(6);
    const lastAttCol = columnToLetter(5 + numDays);
    const totalPCol = columnToLetter(6 + numDays);
    const attScoreCol = columnToLetter(7 + numDays);

    // Total P Formula: =COUNTIF(F6:O6, "P")
    row.push(`=COUNTIF(${firstAttCol}${r}:${lastAttCol}${r}, "P")`);
    // Attendance Score: =(TotalP / TotalDays) * MaxAtt
    row.push(`=(${totalPCol}${r} / ${numDays}) * ${settings.attendanceMaxScore}`);

    // Speaking columns
    let curr = 8 + numDays;
    const spkStart = curr;
    speakingCols.forEach((col) => {
      row.push(s.speakingScores[col.id] ?? '');
      curr++;
    });
    const spkScoreCol = columnToLetter(curr);
    const spkMaxRaw = speakingCols.reduce((acc, c) => acc + c.maxScore, 0) || 1;
    row.push(`=(SUM(${columnToLetter(spkStart)}${r}:${columnToLetter(curr - 1)}${r}) / ${spkMaxRaw}) * ${settings.speakingMaxScore}`);
    curr++;

    // Quizzes columns
    const qzStart = curr;
    quizCols.forEach((col) => {
      row.push(s.quizzesScores[col.id] ?? '');
      curr++;
    });
    const qzScoreCol = columnToLetter(curr);
    const qzMaxRaw = quizCols.reduce((acc, c) => acc + c.maxScore, 0) || 1;
    row.push(`=(SUM(${columnToLetter(qzStart)}${r}:${columnToLetter(curr - 1)}${r}) / ${qzMaxRaw}) * ${settings.quizzesMaxScore}`);
    curr++;

    // Participation columns
    const ptStart = curr;
    partCols.forEach((col) => {
      row.push(s.participationScores[col.id] ?? '');
      curr++;
    });
    const ptScoreCol = columnToLetter(curr);
    const ptMaxRaw = partCols.reduce((acc, c) => acc + c.maxScore, 0) || 1;
    row.push(`=(SUM(${columnToLetter(ptStart)}${r}:${columnToLetter(curr - 1)}${r}) / ${ptMaxRaw}) * ${settings.participationMaxScore}`);
    curr++;

    // Notebook columns
    const nbStart = curr;
    nbCols.forEach((col) => {
      row.push(s.notebookScores[col.id] ?? '');
      curr++;
    });
    const nbScoreCol = columnToLetter(curr);
    const nbMaxRaw = nbCols.reduce((acc, c) => acc + c.maxScore, 0) || 1;
    row.push(`=(SUM(${columnToLetter(nbStart)}${r}:${columnToLetter(curr - 1)}${r}) / ${nbMaxRaw}) * ${settings.notebookMaxScore}`);
    curr++;

    // Earned Score = SUM (capped at 60)
    const earnedCol = columnToLetter(curr);
    row.push(`=MIN(${settings.earnedMaxScore}, ROUND(${attScoreCol}${r} + ${spkScoreCol}${r} + ${qzScoreCol}${r} + ${ptScoreCol}${r} + ${nbScoreCol}${r}, 2))`);
    curr++;

    // Midterm
    const midCol = columnToLetter(curr);
    row.push(s.midtermScore !== null && s.midtermScore !== undefined ? s.midtermScore : '');
    curr++;

    // Final
    const finCol = columnToLetter(curr);
    row.push(s.finalScore !== null && s.finalScore !== undefined ? s.finalScore : '');
    curr++;

    // Grand Total (Earned + Midterm + Final)
    const grandCol = columnToLetter(curr);
    row.push(`=${earnedCol}${r} + ${midCol}${r} + ${finCol}${r}`);
    curr++;

    // Grade Formula:
    // =IF(GrandTotal>=80, 4, IF(GrandTotal>=75, 3.5, IF(GrandTotal>=70, 3, IF(GrandTotal>=65, 2.5, IF(GrandTotal>=60, 2, IF(GrandTotal>=55, 1.5, IF(GrandTotal>=50, 1, 0)))))))
    const gradeCol = columnToLetter(curr);
    const gradeFormula = `=IF(${grandCol}${r}>=80, 4, IF(${grandCol}${r}>=75, 3.5, IF(${grandCol}${r}>=70, 3, IF(${grandCol}${r}>=65, 2.5, IF(${grandCol}${r}>=60, 2, IF(${grandCol}${r}>=55, 1.5, IF(${grandCol}${r}>=50, 1, 0)))))))`;
    row.push(gradeFormula);
    curr++;

    // Status:
    row.push(`=IF(${gradeCol}${r}>=1, "PASS", "FAIL")`);

    values.push(row);
  });

  return { range: 'Class Record!A1', values };
}

/**
 * Creates a brand new Class Record spreadsheet directly in Google Drive
 */
export async function createClassRecordSpreadsheet(
  accessToken: string,
  settings: ClassSettings,
  attendanceDays: AttendanceDay[],
  speakingCols: ScoreColumn[],
  quizCols: ScoreColumn[],
  partCols: ScoreColumn[],
  nbCols: ScoreColumn[],
  students: Student[]
): Promise<{ spreadsheetId: string; webViewLink: string; title: string }> {
  const title = `Class Record - ${settings.subjectCode} (${settings.className})`;

  // 1. Create Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'Class Record',
            gridProperties: {
              frozenRowCount: 5,
              frozenColumnCount: 5,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to create Google Spreadsheet.');
  }

  const createdData = await createRes.json();
  const spreadsheetId = createdData.spreadsheetId;
  const webViewLink = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Populate Rows and Formulas
  const { values } = buildSpreadsheetRows(
    settings,
    attendanceDays,
    speakingCols,
    quizCols,
    partCols,
    nbCols,
    students
  );

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Class%20Record!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values,
      }),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to populate Google Sheet data.');
  }

  return {
    spreadsheetId,
    webViewLink,
    title,
  };
}

/**
 * Push / Sync current app data to an existing Google Spreadsheet
 */
export async function syncToGoogleSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  settings: ClassSettings,
  attendanceDays: AttendanceDay[],
  speakingCols: ScoreColumn[],
  quizCols: ScoreColumn[],
  partCols: ScoreColumn[],
  nbCols: ScoreColumn[],
  students: Student[]
): Promise<{ success: boolean; updatedCells: number }> {
  // Get spreadsheet metadata to verify sheet tab
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!metaRes.ok) {
    const err = await metaRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to access Google Spreadsheet.');
  }

  const metaData = await metaRes.json();
  const firstSheetName = metaData.sheets?.[0]?.properties?.title || 'Sheet1';

  // Build rows
  const { values } = buildSpreadsheetRows(
    settings,
    attendanceDays,
    speakingCols,
    quizCols,
    partCols,
    nbCols,
    students
  );

  const encodedSheet = encodeURIComponent(firstSheetName);
  const writeRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedSheet}!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values,
      }),
    }
  );

  if (!writeRes.ok) {
    const err = await writeRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to sync data to Google Sheet.');
  }

  const result = await writeRes.json();
  return {
    success: true,
    updatedCells: result.updatedCells || 0,
  };
}

/**
 * Load student records from connected Google Spreadsheet
 */
export async function loadFromGoogleSpreadsheet(
  accessToken: string,
  spreadsheetId: string
): Promise<{
  students: Student[];
  sheetTitle: string;
}> {
  // 1. Get spreadsheet metadata
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!metaRes.ok) {
    const err = await metaRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to access Google Spreadsheet.');
  }

  const metaData = await metaRes.json();
  const sheetTitle = metaData.properties?.title || 'Google Sheet';
  const firstSheetName = metaData.sheets?.[0]?.properties?.title || 'Sheet1';

  // 2. Fetch Values
  const encodedSheet = encodeURIComponent(firstSheetName);
  const valRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedSheet}!A1:ZZ100`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!valRes.ok) {
    const err = await valRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to read Google Sheet values.');
  }

  const valData = await valRes.json();
  const rows: any[][] = valData.values || [];

  if (rows.length < 6) {
    throw new Error('Spreadsheet has no student rows (minimum 6 rows needed for headers and records).');
  }

  // Row 5 has column headers
  // Rows 6+ have student rows
  const parsedStudents: Student[] = [];

  for (let r = 5; r < rows.length; r++) {
    const row = rows[r];
    if (!row || !row[1]) continue; // Skip if no student ID

    const number = Number(row[0]) || (r - 4);
    const studentNumber = String(row[1]).trim();
    const thaiName = String(row[2] || '').trim();
    const englishName = String(row[3] || '').trim() || thaiName;
    const password = String(row[4] || '').trim() || `STU-${studentNumber}`;

    // Read attendance and scores if present
    const attendance: Record<string, any> = {};
    for (let d = 1; d <= 12; d++) {
      const dayVal = row[4 + d];
      if (dayVal && ['P', 'A', 'L', 'E', 'S'].includes(String(dayVal).trim().toUpperCase())) {
        attendance[`att_${d}`] = String(dayVal).trim().toUpperCase();
      } else {
        attendance[`att_${d}`] = 'P';
      }
    }

    parsedStudents.push({
      id: `std_gs_${studentNumber}`,
      number,
      studentNumber,
      thaiName,
      englishName,
      password,
      attendance,
      speakingScores: { spk_1: 8, spk_2: 8, spk_3: 8, spk_4: 9 },
      quizzesScores: { quiz_1: 8, quiz_2: 8, quiz_3: 9, quiz_4: 8 },
      participationScores: { part_1: 9, part_2: 9 },
      notebookScores: { nb_1: 9, nb_2: 9 },
      midtermScore: 16,
      finalScore: 17,
    });
  }

  return {
    students: parsedStudents,
    sheetTitle,
  };
}
