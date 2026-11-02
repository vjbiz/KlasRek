import { AttendanceDay, ClassSettings, ScoreColumn, Student } from '../types/classRecord';

export function generateGoogleAppsScript(
  settings: ClassSettings,
  attendanceDays: AttendanceDay[],
  speakingCols: ScoreColumn[],
  quizCols: ScoreColumn[],
  partCols: ScoreColumn[],
  nbCols: ScoreColumn[],
  students: Student[]
): { codeGs: string; sidebarHtml: string; instructions: string } {
  const codeGs = `/**
 * @file Code.gs
 * Google Apps Script for Thai Secondary & Primary Class Record System
 * Features:
 * - Student info: Number, Student ID, Thai Name, English Name
 * - Attendance with P/A/L/E/S validation & 15 max equivalent
 * - Speaking scores (15 max)
 * - Quizzes scores (15 max)
 * - Participation scores (${settings.participationMaxScore} max)
 * - Notebook scores (10 max)
 * - Earned Scores (60 max)
 * - Midterm (20 max) & Final (20 max)
 * - Grand Total Score (100 max)
 * - Official Thai 0-4 Equivalency Grade Formula:
 *   =IF(GrandTotal>=80, 4, IF(GrandTotal>=75, 3.5, IF(GrandTotal>=70, 3, IF(GrandTotal>=65, 2.5, IF(GrandTotal>=60, 2, IF(GrandTotal>=55, 1.5, IF(GrandTotal>=50, 1, 0)))))))
 */

const SHEET_NAME = "Class Record";
const SETTINGS = {
  className: "${settings.className}",
  subjectCode: "${settings.subjectCode}",
  subjectName: "${settings.subjectName}",
  academicYear: "${settings.academicYear}",
  semester: "${settings.semester}",
  teacherName: "${settings.teacherName}",
  attendanceMax: ${settings.attendanceMaxScore},
  speakingMax: ${settings.speakingMaxScore},
  quizzesMax: ${settings.quizzesMaxScore},
  partMax: ${settings.participationMaxScore},
  notebookMax: ${settings.notebookMaxScore},
  earnedMax: ${settings.earnedMaxScore},
  midtermMax: ${settings.midtermMaxScore},
  finalMax: ${settings.finalMaxScore}
};

/**
 * Safe notification helper that works in all execution contexts:
 * - If spreadsheet UI is available (e.g. executed from custom menu or interactive session), shows alert or toast.
 * - If running headless, from script editor, trigger, or Web App context where getUi() throws, gracefully falls back to toast and Logger.log.
 */
function notifyUser_(message, title) {
  title = title || "Class Record";
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) {
      ss.toast(message, title, 5);
    }
  } catch (e) {
    // Ignore toast failure if detached
  }

  try {
    const ui = SpreadsheetApp.getUi();
    if (ui) {
      ui.alert(title, message, ui.ButtonSet.OK);
      return;
    }
  } catch (e) {
    // getUi() is not supported in this context (e.g. running from editor or web app)
    Logger.log("[" + title + "] " + message);
  }
}

/**
 * Creates custom menu when spreadsheet is opened
 */
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    if (ui) {
      ui.createMenu("📚 Class Record System")
        .addItem("🚀 Open Input Dashboard", "openDashboard")
        .addSeparator()
        .addItem("📊 Format & Build Complete Sheet", "buildClassRecordSheet")
        .addItem("✨ Insert Sample Students", "insertSampleData")
        .addItem("🔄 Recalculate Formulas", "refreshFormulas")
        .addToUi();
    }
  } catch (e) {
    Logger.log("onOpen could not initialize UI menu in this context: " + e.message);
  }
}

/**
 * Opens the interactive HTML UI Dashboard Modal / Sidebar
 */
function openDashboard() {
  try {
    const html = HtmlService.createHtmlOutputFromFile("Dashboard")
      .setTitle("Student Grade & Attendance Dashboard")
      .setWidth(950)
      .setHeight(680);
    SpreadsheetApp.getUi().showModalDialog(html, "🎓 Class Record UI Dashboard - " + SETTINGS.subjectCode);
  } catch (e) {
    Logger.log("openDashboard cannot open dialog in this context: " + e.message);
    notifyUser_("Please open the Dashboard from the Google Sheet custom menu: 📚 Class Record System > 🚀 Open Input Dashboard", "Open Dashboard");
  }
}

/**
 * Builds the spreadsheet structure, headers, styling, formulas, and validations
 */
function buildClassRecordSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log("Error: No active spreadsheet found. Please make sure this script is created via Extensions > Apps Script inside your Google Sheet.");
    return;
  }
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  sheet.clear();
  
  // 1. Title Block
  sheet.getRange("A1").setValue("CLASS RECORD & GRADE BOOK (แบบบันทึกผลการเรียน)")
    .setFontSize(16).setFontWeight("bold").setFontColor("#1e3a8a");
  
  sheet.getRange("A2").setValue(
    "Subject: " + SETTINGS.subjectCode + " " + SETTINGS.subjectName + 
    " | Class: " + SETTINGS.className + 
    " | Semester: " + SETTINGS.semester + 
    " | Year: " + SETTINGS.academicYear + 
    " | Teacher: " + SETTINGS.teacherName
  ).setFontSize(10).setFontStyle("italic").setFontColor("#4b5563");

  // Multi-tier Header Construction
  // Row 4: Category Headers
  // Row 5: Sub-headers (Item / Column names & Max score)
  
  // Student Info (Cols A-E)
  sheet.getRange("A4:E4").merge().setValue("STUDENT INFORMATION & CREDENTIALS (ข้อมูลและรหัสผ่าน)")
    .setBackground("#dbeafe").setFontWeight("bold").setHorizontalAlignment("center");
  sheet.getRange("A5").setValue("No. (เลขที่)").setBackground("#eff6ff").setFontWeight("bold");
  sheet.getRange("B5").setValue("Student ID (เลขประจำตัว)").setBackground("#eff6ff").setFontWeight("bold");
  sheet.getRange("C5").setValue("Thai Name (ชื่อ-สกุล)").setBackground("#eff6ff").setFontWeight("bold");
  sheet.getRange("D5").setValue("English Name (ชื่อภาษาอังกฤษ)").setBackground("#eff6ff").setFontWeight("bold");
  sheet.getRange("E5").setValue("Password (รหัสผ่าน)").setBackground("#eff6ff").setFontWeight("bold").setFontColor("#4338ca");

  let colIdx = 6; // Column F
  
  // Attendance Section (10 days sample + Presences Count + Equiv Score out of 15)
  const attStartCol = colIdx;
  const attDaysCount = ${attendanceDays.length};
  for (let i = 1; i <= attDaysCount; i++) {
    sheet.getRange(5, colIdx).setValue("D" + i).setBackground("#ecfdf5").setFontWeight("bold").setHorizontalAlignment("center");
    colIdx++;
  }
  const attDaysEndCol = colIdx - 1;
  const attCountCol = colIdx;
  sheet.getRange(5, colIdx).setValue("Total P").setBackground("#a7f3d0").setFontWeight("bold").setHorizontalAlignment("center");
  colIdx++;
  const attScoreCol = colIdx;
  sheet.getRange(5, colIdx).setValue("Att. (/" + SETTINGS.attendanceMax + ")").setBackground("#34d399").setFontWeight("bold").setHorizontalAlignment("center");
  colIdx++;
  
  sheet.getRange(4, attStartCol, 1, colIdx - attStartCol).merge()
    .setValue("ATTENDANCE (เวลาเรียน - P, A, L, E, S)")
    .setBackground("#10b981").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");

  // Speaking Section (4 cols + Equiv /15)
  const spkStartCol = colIdx;
  const spkCount = ${speakingCols.length};
  for (let i = 1; i <= spkCount; i++) {
    sheet.getRange(5, colIdx).setValue("Spk " + i + " (/10)").setBackground("#fef3c7").setFontWeight("bold").setHorizontalAlignment("center");
    colIdx++;
  }
  const spkScoreCol = colIdx;
  sheet.getRange(5, colIdx).setValue("Speaking (/" + SETTINGS.speakingMax + ")").setBackground("#f59e0b").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");
  colIdx++;
  sheet.getRange(4, spkStartCol, 1, colIdx - spkStartCol).merge()
    .setValue("SPEAKING SCORES (ทักษะการพูด)")
    .setBackground("#d97706").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");

  // Quizzes Section (4 cols + Equiv /15)
  const qzStartCol = colIdx;
  const qzCount = ${quizCols.length};
  for (let i = 1; i <= qzCount; i++) {
    sheet.getRange(5, colIdx).setValue("Quiz " + i + " (/10)").setBackground("#e0e7ff").setFontWeight("bold").setHorizontalAlignment("center");
    colIdx++;
  }
  const qzScoreCol = colIdx;
  sheet.getRange(5, colIdx).setValue("Quizzes (/" + SETTINGS.quizzesMax + ")").setBackground("#6366f1").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");
  colIdx++;
  sheet.getRange(4, qzStartCol, 1, colIdx - qzStartCol).merge()
    .setValue("QUIZZES (การทดสอบย่อย)")
    .setBackground("#4f46e5").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");

  // Participation Section (2 cols + Equiv /${settings.participationMaxScore})
  const ptStartCol = colIdx;
  const ptCount = ${partCols.length};
  for (let i = 1; i <= ptCount; i++) {
    sheet.getRange(5, colIdx).setValue("Part " + i + " (/10)").setBackground("#fae8ff").setFontWeight("bold").setHorizontalAlignment("center");
    colIdx++;
  }
  const ptScoreCol = colIdx;
  sheet.getRange(5, colIdx).setValue("Part. (/" + SETTINGS.partMax + ")").setBackground("#d946ef").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");
  colIdx++;
  sheet.getRange(4, ptStartCol, 1, colIdx - ptStartCol).merge()
    .setValue("PARTICIPATION (การมีส่วนร่วม)")
    .setBackground("#c026d3").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");

  // Notebook Section (2 cols + Equiv /10)
  const nbStartCol = colIdx;
  const nbCount = ${nbCols.length};
  for (let i = 1; i <= nbCount; i++) {
    sheet.getRange(5, colIdx).setValue("NB " + i + " (/10)").setBackground("#fce7f3").setFontWeight("bold").setHorizontalAlignment("center");
    colIdx++;
  }
  const nbScoreCol = colIdx;
  sheet.getRange(5, colIdx).setValue("Notebook (/" + SETTINGS.notebookMax + ")").setBackground("#ec4899").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");
  colIdx++;
  sheet.getRange(4, nbStartCol, 1, colIdx - nbStartCol).merge()
    .setValue("NOTEBOOK (สมุดงาน)")
    .setBackground("#db2777").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");

  // Summary of Earned Scores (60 max)
  const earnedCol = colIdx;
  sheet.getRange(4, earnedCol, 2, 1).merge()
    .setValue("EARNED SCORE\\n(คะแนนเก็บ /" + SETTINGS.earnedMax + ")")
    .setBackground("#0284c7").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle");
  colIdx++;

  // Midterm Test (20 max)
  const midCol = colIdx;
  sheet.getRange(4, midCol, 2, 1).merge()
    .setValue("MIDTERM\\n(กลางภาค /" + SETTINGS.midtermMax + ")")
    .setBackground("#0d9488").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle");
  colIdx++;

  // Final Test (20 max)
  const finCol = colIdx;
  sheet.getRange(4, finCol, 2, 1).merge()
    .setValue("FINAL\\n(ปลายภาค /" + SETTINGS.finalMax + ")")
    .setBackground("#0f766e").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle");
  colIdx++;

  // Grand Total Score (100 max)
  const grandCol = colIdx;
  sheet.getRange(4, grandCol, 2, 1).merge()
    .setValue("GRAND TOTAL\\n(รวม 100)")
    .setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle");
  colIdx++;

  // Thai Grade Equivalency (0 - 4.0)
  const gradeCol = colIdx;
  sheet.getRange(4, gradeCol, 2, 1).merge()
    .setValue("GRADE (เกรด)\\n(0 - 4.0)")
    .setBackground("#ea580c").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle");
  colIdx++;

  // Result Status (Pass/Fail)
  const statusCol = colIdx;
  sheet.getRange(4, statusCol, 2, 1).merge()
    .setValue("RESULT\\n(ผลการเรียน)")
    .setBackground("#b45309").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle");

  sheet.setFrozenRows(5);
  sheet.setFrozenColumns(4);

  // Set column widths
  sheet.setColumnWidth(1, 45); // No.
  sheet.setColumnWidth(2, 95); // ID
  sheet.setColumnWidth(3, 175); // Thai name
  sheet.setColumnWidth(4, 175); // English name

  // Auto-fit other columns
  for (let c = 5; c <= statusCol; c++) {
    sheet.setColumnWidth(c, 58);
  }
  sheet.setColumnWidth(earnedCol, 85);
  sheet.setColumnWidth(midCol, 75);
  sheet.setColumnWidth(finCol, 75);
  sheet.setColumnWidth(grandCol, 90);
  sheet.setColumnWidth(gradeCol, 80);
  sheet.setColumnWidth(statusCol, 80);

  // Add Data Validation for Attendance (P, A, L, E, S)
  const pList = ["P", "A", "L", "E", "S"];
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(pList, true).setAllowInvalid(true).build();
  sheet.getRange(6, attStartCol, 40, attDaysCount).setDataValidation(rule);

  notifyUser_("✅ Class Record Sheet formatted successfully! Use the '📚 Class Record System' menu to insert students or open the Input Dashboard.", "Class Record Setup");
}

/**
 * Inserts sample students with formulas
 */
function insertSampleData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log("Error: No active spreadsheet found. Please make sure this script is created via Extensions > Apps Script inside your Google Sheet.");
    return;
  }
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    buildClassRecordSheet();
    sheet = ss.getSheetByName(SHEET_NAME);
  }

  const sampleRows = [
    [1, "45001", "กิตติพงษ์ ศรีสุข", "Kittipong Srisuk", "STU-45001"],
    [2, "45002", "นัฐพงษ์ วงศ์สุวรรณ", "Natthapong Wongsuwan", "STU-45002"],
    [3, "45003", "พรทิพย์ สุวรรณรัตน์", "Pornthip Suwannarat", "STU-45003"],
    [4, "45004", "ชานนท์ ปรีชาชาญ", "Chanon Preechachan", "STU-45004"],
    [5, "45005", "พิชญาภรณ์ เจริญสุข", "Pitchayaporn Charoensuk", "STU-45005"],
    [6, "45006", "ธนกร พงษ์ไพโรจน์", "Thanakorn Pongpairoj", "STU-45006"],
    [7, "45007", "ศิริพร บุญเกิด", "Siriporn Boonkerd", "STU-45007"],
    [8, "45008", "วรวุฒิ นามสง่า", "Worawut Namsanga", "STU-45008"]
  ];

  const startRow = 6;
  const numDays = ${attendanceDays.length};
  
  sampleRows.forEach((row, i) => {
    const r = startRow + i;
    sheet.getRange(r, 1).setValue(row[0]);
    sheet.getRange(r, 2).setValue(row[1]);
    sheet.getRange(r, 3).setValue(row[2]);
    sheet.getRange(r, 4).setValue(row[3]);
    sheet.getRange(r, 5).setValue(row[4]); // Password

    // Attendance days start at Col 6
    for (let d = 0; d < numDays; d++) {
      const col = 6 + d;
      const rem = (i === 1 && d === 2) ? "L" : (i === 3 && d === 4) ? "S" : (i === 7 && d > 7) ? "A" : "P";
      sheet.getRange(r, col).setValue(rem);
    }

    // Formulas:
    const firstAttColLetter = columnToLetter(6);
    const lastAttColLetter = columnToLetter(5 + numDays);
    const totalPColLetter = columnToLetter(6 + numDays);
    const attScoreColLetter = columnToLetter(7 + numDays);

    // Formula for Total P: =COUNTIF(F6:O6, "P") + (COUNTIF(F6:O6, "L")*0.5)
    sheet.getRange(r, 6 + numDays).setFormula('=COUNTIF(' + firstAttColLetter + r + ':' + lastAttColLetter + r + ', "P")');
    // Formula for Attendance score /15: =(TotalP / TotalDays) * 15
    sheet.getRange(r, 7 + numDays).setFormula('=(' + totalPColLetter + r + ' / ' + numDays + ') * ' + SETTINGS.attendanceMax);

    // Sample Speaking scores
    let curr = 8 + numDays;
    const spkStart = curr;
    for (let s = 0; s < ${speakingCols.length}; s++) {
      sheet.getRange(r, curr).setValue(Math.max(5, 10 - (i % 4)));
      curr++;
    }
    const spkScoreColLetter = columnToLetter(curr);
    // Speaking /15 = (SUM(scores) / MaxSum) * 15
    sheet.getRange(r, curr).setFormula('=(SUM(' + columnToLetter(spkStart) + r + ':' + columnToLetter(curr - 1) + r + ') / ' + (${speakingCols.length} * 10) + ') * ' + SETTINGS.speakingMax);
    curr++;

    // Sample Quizzes
    const qzStart = curr;
    for (let q = 0; q < ${quizCols.length}; q++) {
      sheet.getRange(r, curr).setValue(Math.max(6, 10 - ((i + q) % 3)));
      curr++;
    }
    const qzScoreColLetter = columnToLetter(curr);
    sheet.getRange(r, curr).setFormula('=(SUM(' + columnToLetter(qzStart) + r + ':' + columnToLetter(curr - 1) + r + ') / ' + (${quizCols.length} * 10) + ') * ' + SETTINGS.quizzesMax);
    curr++;

    // Sample Participation
    const ptStart = curr;
    for (let p = 0; p < ${partCols.length}; p++) {
      sheet.getRange(r, curr).setValue(Math.max(7, 10 - (i % 3)));
      curr++;
    }
    const ptScoreColLetter = columnToLetter(curr);
    sheet.getRange(r, curr).setFormula('=(SUM(' + columnToLetter(ptStart) + r + ':' + columnToLetter(curr - 1) + r + ') / ' + (${partCols.length} * 10) + ') * ' + SETTINGS.partMax);
    curr++;

    // Sample Notebook
    const nbStart = curr;
    for (let n = 0; n < ${nbCols.length}; n++) {
      sheet.getRange(r, curr).setValue(Math.max(8, 10 - (i % 2)));
      curr++;
    }
    const nbScoreColLetter = columnToLetter(curr);
    sheet.getRange(r, curr).setFormula('=(SUM(' + columnToLetter(nbStart) + r + ':' + columnToLetter(curr - 1) + r + ') / ' + (${nbCols.length} * 10) + ') * ' + SETTINGS.notebookMax);
    curr++;

    // Earned Score = SUM of attendance + speaking + quizzes + participation + notebook (max 60)
    const earnedColLetter = columnToLetter(curr);
    sheet.getRange(r, curr).setFormula(
      '=MIN(' + SETTINGS.earnedMax + ', ROUND(' + 
      attScoreColLetter + r + ' + ' + 
      spkScoreColLetter + r + ' + ' + 
      qzScoreColLetter + r + ' + ' + 
      ptScoreColLetter + r + ' + ' + 
      nbScoreColLetter + r + ', 2))'
    );
    curr++;

    // Midterm (20 max)
    const midLetter = columnToLetter(curr);
    sheet.getRange(r, curr).setValue(Math.max(10, 19 - i));
    curr++;

    // Final (20 max)
    const finLetter = columnToLetter(curr);
    sheet.getRange(r, curr).setValue(Math.max(11, 18 - i));
    curr++;

    // Grand Total (100 max) = Earned + Midterm + Final
    const grandLetter = columnToLetter(curr);
    sheet.getRange(r, curr).setFormula('=' + earnedColLetter + r + ' + ' + midLetter + r + ' + ' + finLetter + r);
    curr++;

    // Official Thai Equivalency Grade formula:
    // IF(GrandTotal>=80,4,IF(GrandTotal>=75,3.5,IF(GrandTotal>=70,3,IF(GrandTotal>=65,2.5,IF(GrandTotal>=60,2,IF(GrandTotal>=55,1.5,IF(GrandTotal>=50,1,0)))))))
    const gradeLetter = columnToLetter(curr);
    const gradeFormula = '=IF(' + grandLetter + r + '>=80, 4, IF(' + grandLetter + r + '>=75, 3.5, IF(' + grandLetter + r + '>=70, 3, IF(' + grandLetter + r + '>=65, 2.5, IF(' + grandLetter + r + '>=60, 2, IF(' + grandLetter + r + '>=55, 1.5, IF(' + grandLetter + r + '>=50, 1, 0)))))))';
    sheet.getRange(r, curr).setFormula(gradeFormula);
    curr++;

    // Result Status: Pass or Fail
    sheet.getRange(r, curr).setFormula('=IF(' + gradeLetter + r + '>=1, "PASS", "FAIL")');
  });

  notifyUser_("🎉 Sample students inserted with live formulas and passwords!", "Sample Data");
}

/**
 * Refreshes and recalculates formulas across all student rows
 */
function refreshFormulas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log("No active spreadsheet found.");
    return;
  }
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    Logger.log("Sheet " + SHEET_NAME + " not found.");
    return;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 6) {
    notifyUser_("No student records found to recalculate.", "Recalculate");
    return;
  }

  const numDays = ${attendanceDays.length};
  const spkCount = ${speakingCols.length};
  const qzCount = ${quizCols.length};
  const ptCount = ${partCols.length};
  const nbCount = ${nbCols.length};

  for (let r = 6; r <= lastRow; r++) {
    const firstAttColLetter = columnToLetter(6);
    const lastAttColLetter = columnToLetter(5 + numDays);
    const totalPColLetter = columnToLetter(6 + numDays);
    const attScoreColLetter = columnToLetter(7 + numDays);

    sheet.getRange(r, 6 + numDays).setFormula('=COUNTIF(' + firstAttColLetter + r + ':' + lastAttColLetter + r + ', "P")');
    sheet.getRange(r, 7 + numDays).setFormula('=(' + totalPColLetter + r + ' / ' + numDays + ') * ' + SETTINGS.attendanceMax);

    let curr = 8 + numDays;
    const spkStart = curr;
    curr += spkCount;
    const spkScoreColLetter = columnToLetter(curr);
    sheet.getRange(r, curr).setFormula('=(SUM(' + columnToLetter(spkStart) + r + ':' + columnToLetter(curr - 1) + r + ') / ' + (spkCount * 10) + ') * ' + SETTINGS.speakingMax);
    curr++;

    const qzStart = curr;
    curr += qzCount;
    const qzScoreColLetter = columnToLetter(curr);
    sheet.getRange(r, curr).setFormula('=(SUM(' + columnToLetter(qzStart) + r + ':' + columnToLetter(curr - 1) + r + ') / ' + (qzCount * 10) + ') * ' + SETTINGS.quizzesMax);
    curr++;

    const ptStart = curr;
    curr += ptCount;
    const ptScoreColLetter = columnToLetter(curr);
    sheet.getRange(r, curr).setFormula('=(SUM(' + columnToLetter(ptStart) + r + ':' + columnToLetter(curr - 1) + r + ') / ' + (ptCount * 10) + ') * ' + SETTINGS.partMax);
    curr++;

    const nbStart = curr;
    curr += nbCount;
    const nbScoreColLetter = columnToLetter(curr);
    sheet.getRange(r, curr).setFormula('=(SUM(' + columnToLetter(nbStart) + r + ':' + columnToLetter(curr - 1) + r + ') / ' + (nbCount * 10) + ') * ' + SETTINGS.notebookMax);
    curr++;

    const earnedColLetter = columnToLetter(curr);
    sheet.getRange(r, curr).setFormula(
      '=MIN(' + SETTINGS.earnedMax + ', ROUND(' + 
      attScoreColLetter + r + ' + ' + 
      spkScoreColLetter + r + ' + ' + 
      qzScoreColLetter + r + ' + ' + 
      ptScoreColLetter + r + ' + ' + 
      nbScoreColLetter + r + ', 2))'
    );
    curr++;

    const midLetter = columnToLetter(curr);
    curr++;

    const finLetter = columnToLetter(curr);
    curr++;

    const grandLetter = columnToLetter(curr);
    sheet.getRange(r, curr).setFormula('=' + earnedColLetter + r + ' + ' + midLetter + r + ' + ' + finLetter + r);
    curr++;

    const gradeLetter = columnToLetter(curr);
    const gradeFormula = '=IF(' + grandLetter + r + '>=80, 4, IF(' + grandLetter + r + '>=75, 3.5, IF(' + grandLetter + r + '>=70, 3, IF(' + grandLetter + r + '>=65, 2.5, IF(' + grandLetter + r + '>=60, 2, IF(' + grandLetter + r + '>=55, 1.5, IF(' + grandLetter + r + '>=50, 1, 0)))))))';
    sheet.getRange(r, curr).setFormula(gradeFormula);
    curr++;

    sheet.getRange(r, curr).setFormula('=IF(' + gradeLetter + r + '>=1, "PASS", "FAIL")');
  }

  notifyUser_("✅ Formulas refreshed successfully for " + (lastRow - 5) + " students!", "Recalculate");
}

/**
 * Saves or updates student info and marks from the HTML UI Dashboard
 */
function saveStudentFromDashboard(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  
  // Find if student number already exists
  const lastRow = sheet.getLastRow();
  let targetRow = lastRow + 1;
  
  if (lastRow >= 6) {
    const ids = sheet.getRange(6, 2, lastRow - 5, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]).trim() === String(data.studentNumber).trim()) {
        targetRow = 6 + i;
        break;
      }
    }
  }

  // Set Info
  sheet.getRange(targetRow, 1).setValue(data.number || (targetRow - 5));
  sheet.getRange(targetRow, 2).setValue(data.studentNumber);
  sheet.getRange(targetRow, 3).setValue(data.thaiName);
  sheet.getRange(targetRow, 4).setValue(data.englishName);

  return { success: true, row: targetRow };
}

/**
 * Returns JSON of current students for Dashboard display
 */
function getStudentsData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 6) return [];

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const values = sheet.getRange(6, 1, lastRow - 5, lastCol).getValues();

  return values.map((row, idx) => ({
    number: row[0],
    studentNumber: row[1],
    thaiName: row[2],
    englishName: row[3],
  }));
}

/**
 * Converts 1-based column index to letter (A, B, C... AA...)
 */
function columnToLetter(column) {
  let temp, letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

/**
 * Web App Backend Endpoint for Secure Student Login:
 * Validates Student ID and Password against Google Sheet columns B and E.
 * If credentials match, returns ONLY that student's record (never other classmates' data).
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;

    if (action === "studentLogin") {
      const studentId = String(postData.studentId || "").trim().toLowerCase();
      const password = String(postData.password || "").trim();

      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(SHEET_NAME);
      if (!sheet) {
        return createJsonResponse({ success: false, message: "Class Record sheet not found." });
      }

      const lastRow = sheet.getLastRow();
      if (lastRow < 6) {
        return createJsonResponse({ success: false, message: "No student records found in sheet." });
      }

      // Column B is Student ID (col 2), Column E is Password (col 5)
      const idValues = sheet.getRange(6, 2, lastRow - 5, 1).getValues();
      const passValues = sheet.getRange(6, 5, lastRow - 5, 1).getValues();

      let targetRowIndex = -1;
      for (let i = 0; i < idValues.length; i++) {
        const idInSheet = String(idValues[i][0]).trim().toLowerCase();
        const passInSheet = String(passValues[i][0]).trim();
        if (idInSheet === studentId && passInSheet === password) {
          targetRowIndex = 6 + i;
          break;
        }
      }

      if (targetRowIndex === -1) {
        return createJsonResponse({ 
          success: false, 
          message: "Invalid Student ID or Password. Please check your credentials or contact your teacher." 
        });
      }

      // Read ONLY the matched student row
      const lastCol = sheet.getLastColumn();
      const rowData = sheet.getRange(targetRowIndex, 1, 1, lastCol).getValues()[0];

      // Safe individual payload
      const studentPayload = {
        number: rowData[0],
        studentNumber: String(rowData[1]),
        thaiName: String(rowData[2]),
        englishName: String(rowData[3]),
        className: SETTINGS.className,
        subjectCode: SETTINGS.subjectCode,
        subjectName: SETTINGS.subjectName,
        semester: SETTINGS.semester,
        academicYear: SETTINGS.academicYear,
        teacherName: SETTINGS.teacherName
      };

      return createJsonResponse({ success: true, student: studentPayload });
    }

    return createJsonResponse({ success: false, message: "Unknown action." });
  } catch (err) {
    return createJsonResponse({ success: false, message: "Server error: " + err.toString() });
  }
}

function doGet(e) {
  return createJsonResponse({ 
    status: "online", 
    service: "Class Record Student Authentication API", 
    subject: SETTINGS.subjectCode + " " + SETTINGS.subjectName,
    class: SETTINGS.className 
  });
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

  const sidebarHtml = `<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    .score-input { width: 55px; text-align: center; }
  </style>
</head>
<body class="bg-gray-50 p-4 text-gray-800">
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="bg-indigo-700 text-white p-4 rounded-xl shadow-md flex items-center justify-between mb-4">
      <div>
        <h1 class="text-xl font-bold">🎓 Class Record UI Dashboard</h1>
        <p class="text-indigo-200 text-xs">${settings.subjectCode} - ${settings.subjectName} | ${settings.className}</p>
      </div>
      <button onclick="clearForm()" class="bg-indigo-600 hover:bg-indigo-500 text-xs px-3 py-1.5 rounded-lg border border-indigo-400">
        Clear Inputs
      </button>
    </div>

    <!-- Main Entry Form -->
    <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-5">
      <h2 class="text-sm font-bold uppercase tracking-wider text-indigo-900 mb-3">1. Student Details (ข้อมูลนักเรียน)</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">No. (เลขที่)</label>
          <input type="number" id="inpNumber" placeholder="1" class="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500">
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">Student No. (เลขประจำตัว)</label>
          <input type="text" id="inpStudentId" placeholder="e.g. 45001" class="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500">
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">Thai Name (ชื่อ-สกุล ไทย)</label>
          <input type="text" id="inpThaiName" placeholder="สมชาย ใจดี" class="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500">
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">English Name</label>
          <input type="text" id="inpEngName" placeholder="Somchai Jaidee" class="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500">
        </div>
      </div>

      <!-- Attendance Remarks -->
      <h2 class="text-sm font-bold uppercase tracking-wider text-emerald-900 mb-2 mt-4">2. Attendance & Remarks (P, A, L, E, S)</h2>
      <p class="text-xs text-gray-500 mb-2">P = Present, A = Absent, L = Late, E = Excused, S = Sick (Equivalent 15 is highest)</p>
      <div class="flex flex-wrap gap-2 mb-3 items-center">
        ${attendanceDays.slice(0, 10).map((d, i) => `
          <div class="bg-gray-100 p-2 rounded text-center border">
            <span class="block text-xs font-medium text-gray-500">${d.name}</span>
            <select id="att_${i}" class="text-xs font-bold border rounded px-1 py-1" onchange="calculateLive()">
              <option value="P">P</option>
              <option value="A">A</option>
              <option value="L">L</option>
              <option value="E">E</option>
              <option value="S">S</option>
            </select>
          </div>
        `).join('')}
      </div>

      <!-- Scores Grid -->
      <h2 class="text-sm font-bold uppercase tracking-wider text-blue-900 mb-2 mt-4">3. Formative Assessments & Exams</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <!-- Speaking (4 cols) -->
        <div class="border border-yellow-200 bg-yellow-50/50 p-3 rounded-lg">
          <div class="flex justify-between items-center mb-1">
            <span class="font-bold text-xs text-yellow-900">Speaking (Max 15)</span>
          </div>
          <div class="grid grid-cols-2 gap-1 text-xs">
            <input type="number" id="spk_1" placeholder="S1" value="8" class="border p-1 text-center rounded" oninput="calculateLive()">
            <input type="number" id="spk_2" placeholder="S2" value="9" class="border p-1 text-center rounded" oninput="calculateLive()">
            <input type="number" id="spk_3" placeholder="S3" value="8" class="border p-1 text-center rounded" oninput="calculateLive()">
            <input type="number" id="spk_4" placeholder="S4" value="10" class="border p-1 text-center rounded" oninput="calculateLive()">
          </div>
          <div class="text-right text-xs font-bold text-yellow-800 mt-1" id="lblSpeakingEquiv">Equiv: 13.13 / 15</div>
        </div>

        <!-- Quizzes (4 cols) -->
        <div class="border border-indigo-200 bg-indigo-50/50 p-3 rounded-lg">
          <div class="flex justify-between items-center mb-1">
            <span class="font-bold text-xs text-indigo-900">Quizzes (Max 15)</span>
          </div>
          <div class="grid grid-cols-2 gap-1 text-xs">
            <input type="number" id="qz_1" placeholder="Q1" value="9" class="border p-1 text-center rounded" oninput="calculateLive()">
            <input type="number" id="qz_2" placeholder="Q2" value="9" class="border p-1 text-center rounded" oninput="calculateLive()">
            <input type="number" id="qz_3" placeholder="Q3" value="10" class="border p-1 text-center rounded" oninput="calculateLive()">
            <input type="number" id="qz_4" placeholder="Q4" value="8" class="border p-1 text-center rounded" oninput="calculateLive()">
          </div>
          <div class="text-right text-xs font-bold text-indigo-800 mt-1" id="lblQuizEquiv">Equiv: 13.50 / 15</div>
        </div>

        <!-- Participation & Notebook -->
        <div class="border border-pink-200 bg-pink-50/50 p-3 rounded-lg">
          <span class="font-bold text-xs text-pink-900 block mb-1">Participation & NB</span>
          <div class="space-y-1">
            <div class="flex items-center gap-1 text-xs">
              <span class="w-8">Part:</span>
              <input type="number" id="pt_1" placeholder="P1" value="10" class="border p-1 w-12 text-center rounded" oninput="calculateLive()">
              <input type="number" id="pt_2" placeholder="P2" value="9" class="border p-1 w-12 text-center rounded" oninput="calculateLive()">
            </div>
            <div class="flex items-center gap-1 text-xs">
              <span class="w-8">NB:</span>
              <input type="number" id="nb_1" placeholder="N1" value="10" class="border p-1 w-12 text-center rounded" oninput="calculateLive()">
              <input type="number" id="nb_2" placeholder="N2" value="9" class="border p-1 w-12 text-center rounded" oninput="calculateLive()">
            </div>
          </div>
          <div class="text-right text-xs font-bold text-pink-800 mt-1" id="lblPartNbEquiv">Part: 4.75 | NB: 9.50</div>
        </div>

        <!-- Exams (Midterm & Final) -->
        <div class="border border-teal-200 bg-teal-50/50 p-3 rounded-lg">
          <span class="font-bold text-xs text-teal-900 block mb-1">Term Exams</span>
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs">
              <span>Midterm (/20):</span>
              <input type="number" id="inpMidterm" placeholder="20" value="17" max="20" class="border p-1 w-14 text-center rounded font-bold" oninput="calculateLive()">
            </div>
            <div class="flex items-center justify-between text-xs">
              <span>Final (/20):</span>
              <input type="number" id="inpFinal" placeholder="20" value="18" max="20" class="border p-1 w-14 text-center rounded font-bold" oninput="calculateLive()">
            </div>
          </div>
        </div>
      </div>

      <!-- Live Calculation Card -->
      <div class="bg-gradient-to-r from-gray-900 to-indigo-900 text-white p-4 rounded-xl flex items-center justify-between">
        <div class="space-y-1">
          <div class="text-xs text-gray-300">Formative Earned Score (Max 60): <span id="lblEarned" class="font-bold text-white text-sm">55.88 / 60</span></div>
          <div class="text-xs text-gray-300">Exams (Midterm 20 + Final 20): <span id="lblExams" class="font-bold text-white text-sm">35.00 / 40</span></div>
          <div class="text-xs text-indigo-300">Grand Total Score: <span id="lblGrandTotal" class="font-bold text-xl text-yellow-300">90.88 / 100</span></div>
        </div>
        <div class="text-center bg-white/10 px-4 py-2 rounded-xl border border-white/20">
          <div class="text-xs text-gray-200 uppercase font-semibold">Thai Grade</div>
          <div id="lblGrade" class="text-3xl font-black text-emerald-400">4.0</div>
          <div id="lblGradeName" class="text-xs text-emerald-200">Excellent (ดีเยี่ยม)</div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-4 flex justify-end gap-2">
        <button onclick="google.script.host.close()" class="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg">
          Close
        </button>
        <button onclick="submitStudent()" class="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow">
          💾 Save to Spreadsheet
        </button>
      </div>
    </div>
  </div>

  <script>
    function calculateLive() {
      // Attendance
      let pCount = 0;
      for (let i = 0; i < 10; i++) {
        const val = document.getElementById("att_" + i).value;
        if (val === 'P') pCount++;
        else if (val === 'L') pCount += 0.5;
      }
      const attEquiv = (pCount / 10) * 15;

      // Speaking
      const s1 = Number(document.getElementById("spk_1").value) || 0;
      const s2 = Number(document.getElementById("spk_2").value) || 0;
      const s3 = Number(document.getElementById("spk_3").value) || 0;
      const s4 = Number(document.getElementById("spk_4").value) || 0;
      const spkEquiv = ((s1 + s2 + s3 + s4) / 40) * 15;
      document.getElementById("lblSpeakingEquiv").innerText = "Equiv: " + spkEquiv.toFixed(2) + " / 15";

      // Quizzes
      const q1 = Number(document.getElementById("qz_1").value) || 0;
      const q2 = Number(document.getElementById("qz_2").value) || 0;
      const q3 = Number(document.getElementById("qz_3").value) || 0;
      const q4 = Number(document.getElementById("qz_4").value) || 0;
      const qzEquiv = ((q1 + q2 + q3 + q4) / 40) * 15;
      document.getElementById("lblQuizEquiv").innerText = "Equiv: " + qzEquiv.toFixed(2) + " / 15";

      // Participation & Notebook
      const pt1 = Number(document.getElementById("pt_1").value) || 0;
      const pt2 = Number(document.getElementById("pt_2").value) || 0;
      const ptEquiv = ((pt1 + pt2) / 20) * ${settings.participationMaxScore};

      const nb1 = Number(document.getElementById("nb_1").value) || 0;
      const nb2 = Number(document.getElementById("nb_2").value) || 0;
      const nbEquiv = ((nb1 + nb2) / 20) * 10;
      document.getElementById("lblPartNbEquiv").innerText = "Part: " + ptEquiv.toFixed(2) + " | NB: " + nbEquiv.toFixed(2);

      // Earned (Max 60)
      const earned = Math.min(60, attEquiv + spkEquiv + qzEquiv + ptEquiv + nbEquiv);
      document.getElementById("lblEarned").innerText = earned.toFixed(2) + " / 60";

      // Midterm & Final (Max 20 each)
      const mid = Number(document.getElementById("inpMidterm").value) || 0;
      const fin = Number(document.getElementById("inpFinal").value) || 0;
      document.getElementById("lblExams").innerText = (mid + fin).toFixed(2) + " / 40";

      // Grand Total
      const grandTotal = Math.min(100, earned + mid + fin);
      document.getElementById("lblGrandTotal").innerText = grandTotal.toFixed(2) + " / 100";

      // Thai Grade Formula IF(...)
      let grade = 0.0;
      let label = "Fail (ไม่ผ่าน)";
      if (grandTotal >= 80) { grade = 4.0; label = "Excellent (ดีเยี่ยม)"; }
      else if (grandTotal >= 75) { grade = 3.5; label = "Very Good (ดีมาก)"; }
      else if (grandTotal >= 70) { grade = 3.0; label = "Good (ดี)"; }
      else if (grandTotal >= 65) { grade = 2.5; label = "Fairly Good (ค่อนข้างดี)"; }
      else if (grandTotal >= 60) { grade = 2.0; label = "Fair (ปานกลาง)"; }
      else if (grandTotal >= 55) { grade = 1.5; label = "Pass (พอใช้)"; }
      else if (grandTotal >= 50) { grade = 1.0; label = "Minimum Pass (ผ่านขั้นต่ำ)"; }
      else { grade = 0.0; label = "Fail (ไม่ผ่าน)"; }

      document.getElementById("lblGrade").innerText = grade.toFixed(1);
      document.getElementById("lblGradeName").innerText = label;
    }

    function submitStudent() {
      const data = {
        number: document.getElementById("inpNumber").value,
        studentNumber: document.getElementById("inpStudentId").value,
        thaiName: document.getElementById("inpThaiName").value,
        englishName: document.getElementById("inpEngName").value
      };

      if (!data.studentNumber || !data.thaiName) {
        alert("Please enter Student Number and Thai Name");
        return;
      }

      google.script.run
        .withSuccessHandler(function() {
          alert("✅ Student saved successfully into Google Sheet!");
          clearForm();
        })
        .withFailureHandler(function(err) {
          alert("Error: " + err.message);
        })
        .saveStudentFromDashboard(data);
    }

    function clearForm() {
      document.getElementById("inpNumber").value = "";
      document.getElementById("inpStudentId").value = "";
      document.getElementById("inpThaiName").value = "";
      document.getElementById("inpEngName").value = "";
      calculateLive();
    }

    // Initial run
    calculateLive();
  </script>
</body>
</html>
`;

  const instructions = `### 📋 Gabay sa Pag-install ng Google Apps Script sa Google Sheets (Step-by-step)

1. **Buksan ang inyong Google Sheet** (o gumawa ng bago sa [sheets.new](https://sheets.new)).
2. Sa menu sa itaas, i-click ang **Extensions** > **Apps Script**.
3. Sa kaliwang editor panel:
   - Sa file na \`Code.gs\`, i-paste ang buong code mula sa tab na **Code.gs**.
   - I-click ang **+** icon (katabi ng *Files*) > piliin ang **HTML**.
   - Pangalanan itong \`Dashboard\` (o \`Dashboard.html\`).
   - I-paste ang code mula sa tab na **Dashboard.html**.
4. I-click ang **Save icon** 💾 (o pindutin ang Ctrl+S / Cmd+S).
5. Sa dropdown ng functions sa itaas, piliin ang \`onOpen\` o \`buildClassRecordSheet\` at i-click ang **Run**.
   *(Unang beses: hihingi ang Google ng authorization permission — i-click ang "Advanced" > "Go to Untitled project (unsafe)" > "Allow")*.
   *(💡 Tandaan: Ligtas itong patakbuhin diretso sa editor o sa menu ng Google Sheet — may built-in safe context handler para hindi magka-error ang \`SpreadsheetApp.getUi()\`)*.
6. Bumalik sa inyong Google Sheet! Makikita mo na ang bagong custom menu na:
   **📚 Class Record System**
   - **🚀 Open Input Dashboard**: Magbubukas ang UI modal kung saan pwede mag-input ng student details, attendance, scores, at live grade preview!
   - **📊 Format & Build Complete Sheet**: Awtomatikong ise-setup ang lahat ng columns, pastel headers, at formula.
   - **✨ Insert Sample Students**: Maglalagay ng mga halimbawa ng estudyante na may live automated formulas!
   - **🔄 Recalculate Formulas**: Awtomatikong ire-recalculate ang lahat ng formulas para sa lahat ng estudyante.`;

  return { codeGs, sidebarHtml, instructions };
}
