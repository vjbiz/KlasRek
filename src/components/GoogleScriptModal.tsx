import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Code2, 
  FileCode, 
  BookOpen, 
  ExternalLink,
  Sparkles,
  Calculator
} from 'lucide-react';
import { AttendanceDay, ClassSettings, ScoreColumn, Student } from '../types/classRecord';
import { generateGoogleAppsScript } from '../utils/googleAppsScriptGenerator';

interface GoogleScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ClassSettings;
  attendanceDays: AttendanceDay[];
  speakingColumns: ScoreColumn[];
  quizzesColumns: ScoreColumn[];
  participationColumns: ScoreColumn[];
  notebookColumns: ScoreColumn[];
  students: Student[];
}

export const GoogleScriptModal: React.FC<GoogleScriptModalProps> = ({
  isOpen,
  onClose,
  settings,
  attendanceDays,
  speakingColumns,
  quizzesColumns,
  participationColumns,
  notebookColumns,
  students,
}) => {
  const [activeTab, setActiveTab] = useState<'codegs' | 'html' | 'guide' | 'formula'>('codegs');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedFormula, setCopiedFormula] = useState(false);

  if (!isOpen) return null;

  const { codeGs, sidebarHtml, instructions } = generateGoogleAppsScript(
    settings,
    attendanceDays,
    speakingColumns,
    quizzesColumns,
    participationColumns,
    notebookColumns,
    students
  );

  const officialFormula = `=IF(V6>=80, 4, IF(V6>=75, 3.5, IF(V6>=70, 3, IF(V6>=65, 2.5, IF(V6>=60, 2, IF(V6>=55, 1.5, IF(V6>=50, 1, 0)))))))`;

  const copyToClipboard = (text: string, type: 'code' | 'html' | 'formula') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else if (type === 'html') {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    } else {
      setCopiedFormula(true);
      setTimeout(() => setCopiedFormula(false), 2000);
    }
  };

  const downloadFile = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-4">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-10 h-10 object-contain rounded-full border border-emerald-300 bg-white shadow-xs" 
            />
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Google Apps Script Generator (.gs) & UI Dashboard</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-400 text-emerald-950 font-black">
                  Ready to Copy
                </span>
              </h2>
              <p className="text-xs text-emerald-100">
                Awtomatikong gagawa ng class record spreadsheet na may custom menu at UI modal sa Google Sheets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-1 py-2">
            <button
              onClick={() => setActiveTab('codegs')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'codegs'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Code.gs</span>
            </button>

            <button
              onClick={() => setActiveTab('html')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'html'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Dashboard.html</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'guide'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Gabay sa Pag-install (Guide)</span>
            </button>

            <button
              onClick={() => setActiveTab('formula')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'formula'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Equivalency Formula</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://sheets.new"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Open sheets.new</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {/* Tab 1: Code.gs */}
          {activeTab === 'codegs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div>
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-200">
                    Google Apps Script (`Code.gs`)
                  </h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    Naglalaman ng setup menu, automatic formatting, validation para sa P/A/L/E/S, at calculation formulas.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(codeGs, 'code')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Code.gs'}</span>
                  </button>
                  <button
                    onClick={() => downloadFile('Code.gs', codeGs)}
                    className="p-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50"
                    title="Download Code.gs"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed border border-slate-800 max-h-[50vh]">
                  {codeGs}
                </pre>
              </div>
            </div>
          )}

          {/* Tab 2: Dashboard.html */}
          {activeTab === 'html' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <div>
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-200">
                    UI Modal File (`Dashboard.html`)
                  </h4>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                    I-save ito bilang bagong HTML file sa Apps Script editor upang lumabas ang UI dialog sa spreadsheet.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(sidebarHtml, 'html')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    {copiedHtml ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedHtml ? 'Copied!' : 'Copy Dashboard.html'}</span>
                  </button>
                  <button
                    onClick={() => downloadFile('Dashboard.html', sidebarHtml)}
                    className="p-1.5 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50"
                    title="Download Dashboard.html"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed border border-slate-800 max-h-[50vh]">
                  {sidebarHtml}
                </pre>
              </div>
            </div>
          )}

          {/* Tab 3: Guide */}
          {activeTab === 'guide' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950/40 p-4 rounded-xl border border-blue-200 dark:border-indigo-900">
                <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>Paano Gamitin sa Google Sheets (Step-by-Step Tagalog Guide)</span>
                </h3>
                <ol className="list-decimal list-inside space-y-2.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                  <li>
                    <strong>Buksan ang Google Sheet:</strong> Pumunta sa{' '}
                    <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline">
                      sheets.new
                    </a>{' '}
                    para gumawa ng blangkong spreadsheet.
                  </li>
                  <li>
                    <strong>Buksan ang Apps Script:</strong> Sa itaas na menu ng Google Sheets, i-click ang{' '}
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">
                      Extensions &gt; Apps Script
                    </span>.
                  </li>
                  <li>
                    <strong>I-paste ang Code.gs:</strong> Burahin ang default na laman ng <code className="text-emerald-600 font-bold">Code.gs</code> at i-paste ang code mula sa tab na <strong>Code.gs</strong> sa itaas.
                  </li>
                  <li>
                    <strong>Gumawa ng Dashboard.html:</strong> Sa kaliwang bahagi katabi ng <em>Files</em>, i-click ang <strong>+</strong> icon &gt; piliin ang <strong>HTML</strong>. Pangalanan itong <code className="text-indigo-600 font-bold">Dashboard</code> (wag na lagyan ng .html, kusa itong idadagdag). I-paste ang code mula sa tab na <strong>Dashboard.html</strong>.
                  </li>
                  <li>
                    <strong>I-save:</strong> Pindutin ang <strong>Save 💾</strong> icon (Ctrl+S / Cmd+S).
                  </li>
                  <li>
                    <strong>Unang Pag-run:</strong> Sa dropdown sa itaas, piliin ang function na <code className="font-mono text-emerald-600">onOpen</code> o <code className="font-mono text-emerald-600">buildClassRecordSheet</code> at i-click ang <strong>Run</strong>. (Hihingi ang Google ng authorization sa unang beses: click Advanced &gt; Go to project &gt; Allow).
                  </li>
                  <li>
                    <strong>Bumalik sa Google Sheet:</strong> Makikita mo na ang bagong custom menu sa itaas:{' '}
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      📚 Class Record System
                    </span>.
                  </li>
                  <li>
                    <strong>I-deploy bilang Web App para sa Live Student Login:</strong> Sa Apps Script editor, i-click ang asul na button sa itaas: <strong>Deploy &gt; New deployment</strong>.
                    Piliin ang type na <strong>Web app</strong>:
                    <ul className="list-disc list-inside mt-1 ml-4 text-[11px] text-slate-600 dark:text-slate-400">
                      <li>Description: <code className="font-mono">Student Grade Login API</code></li>
                      <li>Execute as: <strong>Me (your email)</strong></li>
                      <li>Who has access: <strong>Anyone</strong> (para makapag-login ang mga estudyante gamit ang kanilang ID &amp; Password)</li>
                    </ul>
                    I-click ang <strong>Deploy</strong>, kopyahin ang <strong>Web app URL</strong>, at i-paste ito sa <strong>Settings &gt; Google Web App URL</strong> ng app!
                  </li>
                </ol>
              </div>

              {/* Menu Features summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="font-bold text-slate-900 dark:text-white mb-1">🚀 Open Input Dashboard</div>
                  <p className="text-slate-500 text-[11px]">
                    Magbubukas ng magandang UI modal kung saan mabilis mag-encode ng No., ID, Thai Name, Attendance, at mga marka.
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="font-bold text-slate-900 dark:text-white mb-1">📊 Build Complete Sheet</div>
                  <p className="text-slate-500 text-[11px]">
                    Awtomatikong magse-set ng kulay, headers, drop-downs para sa P/A/L/E/S, at frozen row/columns.
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="font-bold text-slate-900 dark:text-white mb-1">✨ Insert Sample Students</div>
                  <p className="text-slate-500 text-[11px]">
                    May kasamang 8 sample Thai students na may kumpletong live automated Google Sheets formulas!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Formula */}
          {activeTab === 'formula' && (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                <h4 className="font-bold text-amber-900 dark:text-amber-200 mb-1">
                  Opisyal na Equivalency Grade Formula ng Thailand (0 - 4.0 Scale)
                </h4>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 mb-3">
                  Ito ang eksaktong formula na gagamitin sa Google Sheets cell para sa bawat estudyante:
                </p>

                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-lg border border-amber-300 dark:border-amber-700 mb-3">
                  <code className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 break-all">
                    {officialFormula}
                  </code>
                  <button
                    onClick={() => copyToClipboard(officialFormula, 'formula')}
                    className="ml-3 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-[11px] flex items-center gap-1 flex-shrink-0"
                  >
                    {copiedFormula ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedFormula ? 'Copied' : 'Copy Formula'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 bg-emerald-100/70 dark:bg-emerald-950/40 rounded border border-emerald-300 dark:border-emerald-800">
                    <span className="font-bold text-emerald-900 dark:text-emerald-200">≥ 80 ➔ 4.0</span>
                    <div className="text-[10px] text-emerald-700">Excellent (ดีเยี่ยม)</div>
                  </div>
                  <div className="p-2 bg-teal-100/70 dark:bg-teal-950/40 rounded border border-teal-300 dark:border-teal-800">
                    <span className="font-bold text-teal-900 dark:text-teal-200">≥ 75 ➔ 3.5</span>
                    <div className="text-[10px] text-teal-700">Very Good (ดีมาก)</div>
                  </div>
                  <div className="p-2 bg-blue-100/70 dark:bg-blue-950/40 rounded border border-blue-300 dark:border-blue-800">
                    <span className="font-bold text-blue-900 dark:text-blue-200">≥ 70 ➔ 3.0</span>
                    <div className="text-[10px] text-blue-700">Good (ดี)</div>
                  </div>
                  <div className="p-2 bg-cyan-100/70 dark:bg-cyan-950/40 rounded border border-cyan-300 dark:border-cyan-800">
                    <span className="font-bold text-cyan-900 dark:text-cyan-200">≥ 65 ➔ 2.5</span>
                    <div className="text-[10px] text-cyan-700">Fairly Good (ค่อนข้างดี)</div>
                  </div>
                  <div className="p-2 bg-amber-100/70 dark:bg-amber-950/40 rounded border border-amber-300 dark:border-amber-800">
                    <span className="font-bold text-amber-900 dark:text-amber-200">≥ 60 ➔ 2.0</span>
                    <div className="text-[10px] text-amber-700">Fair (ปานกลาง)</div>
                  </div>
                  <div className="p-2 bg-orange-100/70 dark:bg-orange-950/40 rounded border border-orange-300 dark:border-orange-800">
                    <span className="font-bold text-orange-900 dark:text-orange-200">≥ 55 ➔ 1.5</span>
                    <div className="text-[10px] text-orange-700">Pass (พอใช้)</div>
                  </div>
                  <div className="p-2 bg-stone-200/70 dark:bg-stone-800 rounded border border-stone-300 dark:border-stone-700">
                    <span className="font-bold text-stone-900 dark:text-stone-200">≥ 50 ➔ 1.0</span>
                    <div className="text-[10px] text-stone-600 dark:text-stone-400">Min Pass (ผ่านเกณฑ์)</div>
                  </div>
                  <div className="p-2 bg-rose-100/70 dark:bg-rose-950/40 rounded border border-rose-300 dark:border-rose-800">
                    <span className="font-bold text-rose-900 dark:text-rose-200">&lt; 50 ➔ 0.0</span>
                    <div className="text-[10px] text-rose-700">Fail / Repeat (ไม่ผ่าน)</div>
                  </div>
                </div>
              </div>

              {/* Total points summary breakdown */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">
                  Score Weight Breakdown (Total 100 Points):
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                  <li><strong>Attendance Score:</strong> Max 15 points (Computed as <code className="font-mono text-emerald-600">=(TotalP / TotalDays) * 15</code>)</li>
                  <li><strong>Speaking Scores:</strong> Max 15 points (4+ dynamic columns converted to /15)</li>
                  <li><strong>Quizzes Scores:</strong> Max 15 points (4+ dynamic columns converted to /15)</li>
                  <li><strong>Participation Scores:</strong> Max {settings.participationMaxScore} points</li>
                  <li><strong>Notebook Scores:</strong> Max 10 points (2+ dynamic columns converted to /10)</li>
                  <li><strong>Earned Scores Total:</strong> Attendance + Speaking + Quizzes + Part. + Notebook (Capped at <strong>60 max</strong>)</li>
                  <li><strong>Midterm Exam Score:</strong> Max <strong>20 points</strong></li>
                  <li><strong>Final Exam Score:</strong> Max <strong>20 points</strong></li>
                  <li><strong>Grand Total:</strong> Earned (60) + Midterm (20) + Final (20) = <strong>100 points max</strong></li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Compliant with Thailand Ministry of Education (MOE) & EP standard grading system
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
