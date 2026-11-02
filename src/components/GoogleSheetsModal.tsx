import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Plus, 
  RefreshCw, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  LogOut, 
  FolderOpen, 
  Database, 
  ArrowDownToLine, 
  ArrowUpFromLine,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  googleSignIn, 
  getAccessToken, 
  logout 
} from '../services/googleAuth';
import { 
  createClassRecordSpreadsheet, 
  listUserSpreadsheets, 
  syncToGoogleSpreadsheet, 
  loadFromGoogleSpreadsheet,
  DriveSpreadsheetFile 
} from '../services/googleSheetsService';
import { 
  AttendanceDay, 
  ClassSettings, 
  ScoreColumn, 
  Student 
} from '../types/classRecord';

interface GoogleSheetsModalProps {
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
  onImportStudents: (students: Student[]) => void;
  connectedSpreadsheetId: string | null;
  onConnectSpreadsheet: (id: string, url: string, name: string) => void;
  connectedSpreadsheetName: string | null;
  connectedSpreadsheetUrl: string | null;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
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
  onImportStudents,
  connectedSpreadsheetId,
  onConnectSpreadsheet,
  connectedSpreadsheetName,
  connectedSpreadsheetUrl,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'connect' | 'sync'>('create');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Drive files
  const [driveFiles, setDriveFiles] = useState<DriveSpreadsheetFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [manualSheetId, setManualSheetId] = useState('');

  // Confirmation dialog for sync
  const [confirmSyncAction, setConfirmSyncAction] = useState<'push' | 'pull' | null>(null);

  // Fetch Drive spreadsheets when tab is switched to 'connect'
  useEffect(() => {
    if (isOpen && currentUser && activeTab === 'connect') {
      fetchDriveFiles();
    }
  }, [isOpen, currentUser, activeTab]);

  if (!isOpen) return null;

  const fetchDriveFiles = async () => {
    try {
      setIsLoadingFiles(true);
      const token = await getAccessToken();
      if (!token) return;
      const files = await listUserSpreadsheets(token);
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Error fetching spreadsheets:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setStatusMessage(null);
      const result = await googleSignIn();
      if (result) {
        onAuthChange(result.user);
        setStatusMessage({ type: 'success', text: `Successfully connected as ${result.user.email}` });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Google Sign-In failed.' });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    onAuthChange(null);
    setStatusMessage(null);
  };

  const handleCreateNewSheet = async () => {
    try {
      setIsLoading(true);
      setStatusMessage(null);
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Please sign in with Google first.');
      }

      const created = await createClassRecordSpreadsheet(
        token,
        settings,
        attendanceDays,
        speakingColumns,
        quizzesColumns,
        participationColumns,
        notebookColumns,
        students
      );

      onConnectSpreadsheet(created.spreadsheetId, created.webViewLink, created.title);
      setStatusMessage({
        type: 'success',
        text: `🎉 Class Record created in Google Drive: "${created.title}"!`,
      });
      setActiveTab('sync');
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to create spreadsheet.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectSelected = (file: DriveSpreadsheetFile) => {
    onConnectSpreadsheet(file.id, file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`, file.name);
    setStatusMessage({ type: 'success', text: `Connected to "${file.name}"` });
    setActiveTab('sync');
  };

  const handleConnectManual = () => {
    let cleanId = manualSheetId.trim();
    if (!cleanId) return;

    // If full URL was pasted, extract spreadsheet ID
    const match = cleanId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      cleanId = match[1];
    }

    onConnectSpreadsheet(cleanId, `https://docs.google.com/spreadsheets/d/${cleanId}/edit`, `Google Sheet (${cleanId.slice(0, 8)}...)`);
    setStatusMessage({ type: 'success', text: `Connected to Google Sheet ID: ${cleanId}` });
    setActiveTab('sync');
  };

  // Perform Push (Export to Sheet) after explicit user confirmation
  const handleExecutePush = async () => {
    if (!connectedSpreadsheetId) return;
    try {
      setIsLoading(true);
      setStatusMessage(null);
      setConfirmSyncAction(null);
      const token = await getAccessToken();
      if (!token) throw new Error('Authentication expired. Please sign in again.');

      const result = await syncToGoogleSpreadsheet(
        token,
        connectedSpreadsheetId,
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
        text: `✅ Successfully synced ${result.updatedCells} cells to Google Sheet!`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to sync to Google Sheet.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Perform Pull (Import from Sheet) after explicit user confirmation
  const handleExecutePull = async () => {
    if (!connectedSpreadsheetId) return;
    try {
      setIsLoading(true);
      setStatusMessage(null);
      setConfirmSyncAction(null);
      const token = await getAccessToken();
      if (!token) throw new Error('Authentication expired. Please sign in again.');

      const result = await loadFromGoogleSpreadsheet(token, connectedSpreadsheetId);
      onImportStudents(result.students);

      setStatusMessage({
        type: 'success',
        text: `✅ Successfully imported ${result.students.length} students from "${result.sheetTitle}"!`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to import from Google Sheet.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-4">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10">
              <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Google Sheets Integration</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-400 text-emerald-950 font-black">
                  Official 1P API
                </span>
              </h2>
              <p className="text-xs text-emerald-100">
                Connect your Google Drive &amp; Sheets to create, sync, and backup student records
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

        {/* Auth Banner */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="Avatar" className="w-7 h-7 rounded-full border" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center">
                  {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                </div>
              )}
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <span>{currentUser.displayName || 'Google User'}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                    Connected
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">{currentUser.email}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>Connect your Google Account to access Google Drive &amp; Sheets</span>
            </div>
          )}

          <div>
            {currentUser ? (
              <button
                onClick={handleSignOut}
                className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-[11px] flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Disconnect</span>
              </button>
            ) : (
              /* Official Google Sign In button markup following SKILL.md specification */
              <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs shadow-2xs transition-all disabled:opacity-60 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        {currentUser && (
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-100/50 dark:bg-slate-800/40 text-xs">
            <button
              onClick={() => setActiveTab('create')}
              className={`py-2.5 px-3 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'create'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-lg'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Sheet</span>
            </button>
            <button
              onClick={() => setActiveTab('connect')}
              className={`py-2.5 px-3 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'connect'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-lg'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Connect Existing</span>
            </button>
            <button
              onClick={() => setActiveTab('sync')}
              className={`py-2.5 px-3 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'sync'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-lg'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync &amp; Backup</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Status Message */}
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

          {!currentUser ? (
            <div className="text-center py-10 space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-emerald-600">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Connect Google Sheets &amp; Drive
                </h3>
                <p className="text-slate-500 text-xs">
                  Authorize your Google Account to create real-time spreadsheets, backup student grades, and access live grade records in Google Drive.
                </p>
              </div>
              <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            </div>
          ) : (
            <>
              {/* TAB 1: Create New Sheet */}
              {activeTab === 'create' && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                    <h4 className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Instant Class Record Spreadsheet Generator</span>
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">
                      This will create a new Google Spreadsheet directly in your personal Google Drive containing:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                      <li>Official Thai grading formula: <code className="font-mono text-indigo-600 dark:text-indigo-400">=IF(Total&gt;=80, 4, ...)</code></li>
                      <li>Multi-tier headers with frozen columns &amp; rows</li>
                      <li>Attendance dropdown validations (P, A, L, E, S) &amp; score /15</li>
                      <li>Speaking, Quizzes, Participation, and Notebook equivalent calculations</li>
                      <li>All {students.length} current student records with assigned passwords</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-[11px] text-slate-500">File Name to Create:</span>
                    <div className="font-bold text-slate-900 dark:text-white font-mono">
                      Class Record - {settings.subjectCode} ({settings.className})
                    </div>
                  </div>

                  <button
                    onClick={handleCreateNewSheet}
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>Create &amp; Format in My Google Drive</span>
                  </button>
                </div>
              )}

              {/* TAB 2: Connect Existing Sheet */}
              {activeTab === 'connect' && (
                <div className="space-y-4">
                  {/* Manual Paste */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <label className="block font-bold text-slate-800 dark:text-slate-200">
                      Paste Google Sheet URL or ID
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                        value={manualSheetId}
                        onChange={(e) => setManualSheetId(e.target.value)}
                        className="flex-1 p-2 rounded-lg border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 font-mono text-xs"
                      />
                      <button
                        onClick={handleConnectManual}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg"
                      >
                        Connect
                      </button>
                    </div>
                  </div>

                  {/* Drive Files List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Or Pick From Your Google Drive Spreadsheets:
                      </span>
                      <button
                        onClick={fetchDriveFiles}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Refresh List</span>
                      </button>
                    </div>

                    {isLoadingFiles ? (
                      <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                        <span>Scanning Google Drive...</span>
                      </div>
                    ) : driveFiles.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 border rounded-xl">
                        No Google Spreadsheets found in your Google Drive.
                      </div>
                    ) : (
                      <div className="max-h-56 overflow-y-auto space-y-1.5 border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-900/50">
                        {driveFiles.map((file) => (
                          <div
                            key={file.id}
                            className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 flex items-center justify-between gap-3 transition-colors"
                          >
                            <div className="truncate flex-1">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                                {file.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ID: {file.id.slice(0, 16)}...
                              </span>
                            </div>
                            <button
                              onClick={() => handleConnectSelected(file)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] whitespace-nowrap"
                            >
                              Select &amp; Link
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Sync & Backup */}
              {activeTab === 'sync' && (
                <div className="space-y-4">
                  {connectedSpreadsheetId ? (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400">
                          Active Linked Spreadsheet
                        </span>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {connectedSpreadsheetName || 'Class Record Spreadsheet'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          ID: {connectedSpreadsheetId}
                        </div>
                      </div>
                      {connectedSpreadsheetUrl && (
                        <a
                          href={connectedSpreadsheetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                        >
                          <span>Open in Sheets</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                      No Google Spreadsheet connected yet. Please create a new sheet or select one from the other tabs first.
                    </div>
                  )}

                  {/* Sync Actions */}
                  {connectedSpreadsheetId && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {/* Push to Google Sheet */}
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300">
                          <ArrowUpFromLine className="w-4 h-4 text-indigo-600" />
                          <span>Push / Sync to Sheet</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Exports all current student grades, attendance remarks, and passwords into the connected Google Sheet.
                        </p>
                        <button
                          onClick={() => setConfirmSyncAction('push')}
                          disabled={isLoading}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs"
                        >
                          Sync Data to Google Sheet
                        </button>
                      </div>

                      {/* Pull from Google Sheet */}
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-teal-900 dark:text-teal-300">
                          <ArrowDownToLine className="w-4 h-4 text-teal-600" />
                          <span>Pull / Load from Sheet</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Imports students and scores from the Google Sheet into the application.
                        </p>
                        <button
                          onClick={() => setConfirmSyncAction('pull')}
                          disabled={isLoading}
                          className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs"
                        >
                          Load from Google Sheet
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Mandatory Confirmation Modal for Destructive / Mutating operations (as specified in SKILL.md) */}
          {confirmSyncAction && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-2xl">
                <div className="flex items-center gap-2.5 text-amber-600">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {confirmSyncAction === 'push'
                      ? 'Confirm Overwrite Google Sheet?'
                      : 'Confirm Load from Google Sheet?'}
                  </h3>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {confirmSyncAction === 'push'
                    ? `Are you sure you want to update "${connectedSpreadsheetName || 'Google Sheet'}"? This will overwrite the spreadsheet cells with current grades and attendance for ${students.length} students.`
                    : `Are you sure you want to load from "${connectedSpreadsheetName || 'Google Sheet'}"? This will replace the local student list with the records found in the Google Sheet.`}
                </p>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setConfirmSyncAction(null)}
                    className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSyncAction === 'push' ? handleExecutePush : handleExecutePull}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm"
                  >
                    Yes, Proceed
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            Connected with Google Sheets &amp; Drive APIs via OAuth
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 dark:bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
